import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'stratfi_session';

function getStoredSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(getStoredSession);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize Supabase Auth state
  useEffect(() => {
    async function getInitialSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session: sbSession } } = await supabase.auth.getSession();
      
      if (sbSession) {
        // If we have a Supabase session, verify if we need to update our local state
        const stored = getStoredSession();
        if (!stored || stored.role !== 'teacher' || stored.userId !== sbSession.user.id) {
          const teacherSession = {
            role: 'teacher',
            userId: sbSession.user.id,
            email: sbSession.user.email,
            // We might want to fetch profile data here too
          };
          setSession(teacherSession);
          localStorage.setItem(SESSION_KEY, JSON.stringify(teacherSession));
        }
      }
      setLoading(false);
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (sbSession) {
        const teacherSession = {
          role: 'teacher',
          userId: sbSession.user.id,
          email: sbSession.user.email,
        };
        setSession(teacherSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(teacherSession));
      } else {
        // Only clear if the current session is a teacher session
        const stored = getStoredSession();
        if (stored && stored.role === 'teacher') {
          setSession(null);
          localStorage.removeItem(SESSION_KEY);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginStudent = useCallback(async (joinCode, firmName, pin) => {
    if (!supabase) {
      const msg = 'Supabase not configured. Check environment variables.';
      setError(msg);
      throw new Error(msg);
    }
    setError(null);

    // Find the game by join code
    const { data: game, error: gameErr } = await supabase
      .from('games')
      .select('id, name, current_round, round_status')
      .eq('join_code', joinCode.toUpperCase().trim())
      .eq('is_archived', false)
      .single();

    if (gameErr || !game) {
      const msg = 'Game not found. Check your join code.';
      setError(msg);
      throw new Error(msg);
    }

    // Find the firm in this game
    const { data: firm, error: firmErr } = await supabase
      .from('firms')
      .select('id, name, pin')
      .eq('game_id', game.id)
      .eq('name', firmName.trim())
      .single();

    if (firmErr || !firm) {
      const msg = 'Firm not found in this game.';
      setError(msg);
      throw new Error(msg);
    }

    if (firm.pin !== pin.trim()) {
      const msg = 'Incorrect PIN.';
      setError(msg);
      throw new Error(msg);
    }

    const newSession = {
      role: 'student',
      gameId: game.id,
      gameName: game.name,
      firmId: firm.id,
      firmName: firm.name,
      joinCode: joinCode.toUpperCase().trim()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return newSession;
  }, []);

  const signUpInstructor = useCallback(async (email, password, metadata) => {
    if (!supabase) throw new Error('Supabase not configured');
    setError(null);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName,
          last_name: metadata.lastName,
          institution: metadata.institution,
          purpose: metadata.purpose
        }
      }
    });

    if (signUpErr) {
      setError(signUpErr.message);
      throw signUpErr;
    }

    // Profile creation is handled by the database trigger 'handle_new_user'
    // using the metadata provided in the options above.

    return data;
  }, []);

  const loginInstructor = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured');
    setError(null);

    const { data, error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      throw loginErr;
    }

    return data;
  }, []);

  // Legacy teacher login (for backward compatibility if needed, or we can remove it)
  const loginTeacherLegacy = useCallback(async (joinCode, teacherPin) => {
    if (!supabase) {
      const msg = 'Supabase not configured. Check environment variables.';
      setError(msg);
      throw new Error(msg);
    }
    setError(null);

    const { data: game, error: gameErr } = await supabase
      .from('games')
      .select('id, name, teacher_pin, current_round, round_status')
      .eq('join_code', joinCode.toUpperCase().trim())
      .eq('is_archived', false)
      .single();

    if (gameErr || !game) {
      const msg = 'Game not found. Check your join code.';
      setError(msg);
      throw new Error(msg);
    }

    if (game.teacher_pin !== teacherPin.trim()) {
      const msg = 'Incorrect teacher PIN.';
      setError(msg);
      throw new Error(msg);
    }

    const newSession = {
      role: 'teacher',
      gameId: game.id,
      gameName: game.name,
      joinCode: joinCode.toUpperCase().trim()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return newSession;
  }, []);

  const logout = useCallback(async () => {
    if (session?.role === 'teacher' && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setError(null);
  }, [session]);

  return { 
    session, 
    loading, 
    error, 
    loginStudent, 
    signUpInstructor, 
    loginInstructor, 
    loginTeacherLegacy, 
    logout 
  };
}