import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useLeaderboard(gameId) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!supabase || !gameId) return;
    setLoading(true);

    try {
      // 1. Fetch all firms in the game
      const { data: firms, error: firmsErr } = await supabase
        .from('firms')
        .select('id, name')
        .eq('game_id', gameId);

      if (firmsErr) throw firmsErr;

      // 2. Fetch the latest firm states
      const { data: states, error: statesErr } = await supabase
        .from('firm_state')
        .select('firm_id, round, state')
        .eq('game_id', gameId)
        .order('round', { ascending: false });

      if (statesErr) throw statesErr;

      // 3. Process data
      const results = firms.map(firm => {
        const firmStates = states.filter(s => s.firm_id === firm.id);
        const latestState = firmStates[0]; 
        const prevState = firmStates[1]; // Get the round before the latest
        
        return {
          id: firm.id,
          name: firm.name,
          roe: latestState?.state?.roe || 0,
          eva: latestState?.state?.financials?.eva || latestState?.state?.eva || 0,
          prevEva: prevState?.state?.financials?.eva || prevState?.state?.eva || null,
          revenue: latestState?.state?.revenue || 0,
          netIncome: latestState?.state?.netIncome || 0,
          round: latestState?.round || 0
        };
      }).filter(r => r.round > 0); // Only show firms that have at least one round of results

      // Sort by EVA descending
      results.sort((a, b) => b.eva - a.eva);
      setLeaderboard(results);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, refresh: fetchLeaderboard };
}
