import { useState, useCallback } from 'react';
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
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const loginStudent = useCallback(async (joinCode, firmName, pin) => {
    if (!supabase) throw new Error('Supabase not configured');
    setError(null);

    // Find the game by join code
    const { data: game, error: gameErr } = await supabase
      .from('games')
      .select('id, name, current_round, round_status')
      .eq('join_code', joinCode.toUpperCase().trim())
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

  const loginTeacher = useCallback(async (joinCode, teacherPin) => {
    if (!supabase) throw new Error('Supabase not configured');
    setError(null);

    const { data: game, error: gameErr } = await supabase
      .from('games')
      .select('id, name, teacher_pin, current_round, round_status')
      .eq('join_code', joinCode.toUpperCase().trim())
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

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setError(null);
  }, []);

  return { session, loading, error, loginStudent, loginTeacher, logout };
}
