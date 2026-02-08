import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLoanRequests(session, gameData) {
  const [loanRequests, setLoanRequests] = useState(null);
  const [allApprovedLoans, setAllApprovedLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !gameData) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      if (!supabase) return;
      
      try {
        // 1. Fetch current round requests
        const { data: currentData } = await supabase
          .from('loan_requests')
          .select('*')
          .eq('game_id', session.gameId)
          .eq('firm_id', session.firmId)
          .eq('round', gameData.current_round);

        // 2. Fetch ALL approved/partial loans for this firm (historical)
        const { data: historicalData } = await supabase
          .from('loan_requests')
          .select('*')
          .eq('game_id', session.gameId)
          .eq('firm_id', session.firmId)
          .in('status', ['approved', 'partial']);

        if (cancelled) return;

        if (currentData && currentData.length > 0) {
          const formatted = { ST: null, LT: null };
          currentData.forEach(req => {
            formatted[req.loan_type] = req;
          });
          setLoanRequests(formatted);
        } else {
          setLoanRequests(null);
        }

        if (historicalData) {
          setAllApprovedLoans(historicalData);
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, [session, gameData?.current_round, gameData?.round_status]);

  return { loanRequests, allApprovedLoans, loading };
}
