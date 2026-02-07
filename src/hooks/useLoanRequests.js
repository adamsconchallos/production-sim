import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLoanRequests(session, gameData) {
  const [loanRequests, setLoanRequests] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !gameData) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRequests() {
      if (!supabase) return;
      
      try {
        const { data, error } = await supabase
          .from('loan_requests')
          .select('*')
          .eq('game_id', session.gameId)
          .eq('firm_id', session.firmId)
          .eq('round', gameData.current_round);

        if (error) throw error;

        if (cancelled) return;

        if (data && data.length > 0) {
          const formatted = { ST: null, LT: null };
          data.forEach(req => {
            formatted[req.loan_type] = req;
          });
          setLoanRequests(formatted);
        } else {
          setLoanRequests(null);
        }
      } catch (err) {
        console.error("Error fetching loan requests:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRequests();

    return () => { cancelled = true; };
  }, [session, gameData?.current_round, gameData?.round_status]);

  return { loanRequests, loading };
}
