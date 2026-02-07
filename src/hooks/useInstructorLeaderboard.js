import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useInstructorLeaderboard(gameId) {
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

      // 2. Fetch the latest firm states with financials
      const { data: states, error: statesErr } = await supabase
        .from('firm_state')
        .select('firm_id, round, state')
        .eq('game_id', gameId)
        .order('round', { ascending: false });

      if (statesErr) throw statesErr;

      // 3. Process data for DuPont Analysis
      const results = firms.map(firm => {
        const firmStates = states.filter(s => s.firm_id === firm.id);
        const latestState = firmStates[0];

        if (!latestState || latestState.round === 0) {
          return null; // Skip firms with no actual results
        }

        const fin = latestState.state?.financials || latestState.state;
        const revenue = fin.revenue || 0;
        const netIncome = fin.netIncome || 0;
        const totalAssets = fin.totalAssets || 0;
        const equity = fin.equity || 1; // Avoid division by zero
        const roe = fin.roe || 0;

        // DuPont Analysis Components
        const profitMargin = revenue !== 0 ? (netIncome / revenue) * 100 : 0;
        const assetTurnover = totalAssets !== 0 ? revenue / totalAssets : 0;
        const roa = totalAssets !== 0 ? (netIncome / totalAssets) * 100 : 0;
        const equityMultiplier = equity !== 0 ? totalAssets / equity : 0;

        // Verify DuPont: ROE = Profit Margin × Asset Turnover × Equity Multiplier
        // const dupontROE = (profitMargin / 100) * assetTurnover * equityMultiplier * 100;

        return {
          id: firm.id,
          name: firm.name,
          roe: roe,
          profitMargin: profitMargin,
          assetTurnover: assetTurnover,
          roa: roa,
          equityMultiplier: equityMultiplier,
          revenue: revenue,
          netIncome: netIncome,
          totalAssets: totalAssets,
          equity: equity,
          round: latestState.round
        };
      }).filter(r => r !== null);

      // Sort by ROE descending
      results.sort((a, b) => b.roe - a.roe);
      setLeaderboard(results);
    } catch (err) {
      console.error('Error fetching instructor leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, refresh: fetchLeaderboard };
}
