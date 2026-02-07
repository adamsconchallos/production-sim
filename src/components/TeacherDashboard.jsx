import { useState, useEffect, useCallback } from 'react';
import { Calculator, LogOut, Plus, Users, Play, Square, Zap, RefreshCw, Trash2, Copy, RotateCcw, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearMarket as runClearMarket, computeFirmActualResults, calculateAR1Forecast } from '../engine/marketClearing';
import { DEFAULT_SCENARIOS } from '../constants/defaults';
import BalanceSheetEditor from './teacher/BalanceSheetEditor';
import DemandCurveEditor from './teacher/DemandCurveEditor';

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const TeacherDashboard = ({ session, logout }) => {
  const [game, setGame] = useState(null);
  const [firms, setFirms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('roster');
  const [newFirmName, setNewFirmName] = useState('');
  const [message, setMessage] = useState(null);
  const [clearingData, setClearingData] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [editSetup, setEditSetup] = useState(null);
  const [editRates, setEditRates] = useState(null);
  const [editParameters, setEditParameters] = useState(null);
  const [savingSetup, setSavingSetup] = useState(false);
  const [savingParams, setSavingParams] = useState(false);

  const fetchGame = useCallback(async () => {
    if (!supabase || !session?.gameId) return;
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', session.gameId)
      .single();
    if (data) {
      setGame(data);
      setEditSetup(data.setup);
      setEditRates(data.rates);
      setEditParameters(data.parameters);
    }
  }, [session]);

  const fetchFirms = useCallback(async () => {
    if (!supabase || !session?.gameId) return;
    const { data } = await supabase
      .from('firms')
      .select('*')
      .eq('game_id', session.gameId)
      .order('created_at');
    if (data) setFirms(data);
  }, [session]);

  const fetchSubmissions = useCallback(async (currentGame) => {
    if (!supabase || !session?.gameId) return;
    const round = currentGame?.current_round ?? game?.current_round;
    if (round == null) return;
    const { data } = await supabase
      .from('decisions')
      .select('firm_id, round, submitted_at')
      .eq('game_id', session.gameId)
      .eq('round', round);
    if (data) setSubmissions(data);
  }, [session, game]);

  // Load all data on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || !session?.gameId) { setLoading(false); return; }
      const { data: gameData } = await supabase
        .from('games').select('*').eq('id', session.gameId).single();
      if (cancelled) return;
      if (gameData) {
        setGame(gameData);
        setEditSetup(gameData.setup);
        setEditRates(gameData.rates);
        setEditParameters(gameData.parameters);
        const { data: firmsData } = await supabase
          .from('firms').select('*').eq('game_id', session.gameId).order('created_at');
        if (!cancelled && firmsData) setFirms(firmsData);
        const { data: subsData } = await supabase
          .from('decisions').select('firm_id, round, submitted_at')
          .eq('game_id', session.gameId).eq('round', gameData.current_round);
        if (!cancelled && subsData) setSubmissions(subsData);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [session]);

  // --- ACTIONS ---
  const addFirm = async () => {
    if (!newFirmName.trim()) return;
    const pin = generatePin();
    const { error } = await supabase.from('firms').insert({
      game_id: session.gameId,
      name: newFirmName.trim(),
      pin
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: `Firm "${newFirmName.trim()}" created with PIN: ${pin}` });
      setNewFirmName('');
      fetchFirms();
    }
  };

  const deleteFirm = async (firmId, firmName) => {
    if (!confirm(`Delete firm "${firmName}"? This will remove all their data.`)) return;
    await supabase.from('firms').delete().eq('id', firmId);
    fetchFirms();
  };

  const openRound = async () => {
    const nextRound = (game.current_round || 0) + 1;
    if (nextRound > 3) {
      setMessage({ type: 'error', text: 'Game is complete (3 rounds played).' });
      return;
    }
    await supabase.from('games').update({
      current_round: nextRound,
      round_status: 'open'
    }).eq('id', session.gameId);
    setMessage({ type: 'success', text: `Round ${nextRound} is now open for submissions.` });
    fetchGame();
  };

  const closeSubmissions = async () => {
    await supabase.from('games').update({
      round_status: 'closed'
    }).eq('id', session.gameId);
    setMessage({ type: 'success', text: 'Submissions closed.' });
    fetchGame();
  };

  const clearMarket = async () => {
    setClearing(true);
    setClearingData(null);
    setMessage({ type: 'info', text: 'Clearing market...' });

    try {
      // 1. Fetch game config (parameters, setup, rates)
      const { data: gameConfig, error: gcErr } = await supabase
        .from('games')
        .select('parameters, setup, rates, current_round')
        .eq('id', session.gameId)
        .single();
      if (gcErr || !gameConfig) throw new Error('Could not load game config');

      // 2. Fetch all decisions for current round
      const { data: allDecisions, error: decErr } = await supabase
        .from('decisions')
        .select('firm_id, data')
        .eq('game_id', session.gameId)
        .eq('round', gameConfig.current_round);
      if (decErr) throw new Error('Could not load decisions');

      if (!allDecisions || allDecisions.length === 0) {
        throw new Error('No decisions submitted for this round');
      }

      // 3. Fetch firm states from previous round (or initial for round 1)
      const prevRound = gameConfig.current_round - 1;
      const firmStates = {};
      if (prevRound >= 0) { // Changed from 1 to 0 to support Round 0 lookup
        const { data: states } = await supabase
          .from('firm_state')
          .select('firm_id, state, inventory_details, efficiency')
          .eq('game_id', session.gameId)
          .eq('round', prevRound);
        if (states) states.forEach(s => { firmStates[s.firm_id] = s; });
      }

      // 4. Cap offered sales to actual available stock (production + inventory)
      const firmDecisions = allDecisions.map(d => ({
        firmId: d.firm_id,
        data: JSON.parse(JSON.stringify(d.data))
      }));
      for (const fd of firmDecisions) {
        const fs = firmStates[fd.firmId];
        const invDetails = fs?.inventory_details
          || { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } };
        ['A', 'B', 'C'].forEach(p => {
          const prodQty = fd.data.qty[p] || 0;
          const invUnits = invDetails[p]?.units || 0;
          const available = prodQty + invUnits;
          if ((fd.data.sales[p] || 0) > available) {
            fd.data.sales[p] = available;
          }
        });
      }

      // 5. Run market clearing algorithm
      const results = runClearMarket(gameConfig.parameters, firmDecisions);

      // 6. Compute actual results for each submitting firm
      const stateInserts = [];
      for (const fd of firmDecisions) {
        const fs = firmStates[fd.firmId] || null;
        // If fs is null (shouldn't happen if Round 0 is seeded), we use gameConfig.setup
        const baseState = fs?.state || gameConfig.setup;
        
        const actual = computeFirmActualResults(
          fd.data, results, fs, gameConfig.setup, gameConfig.rates
        );
        stateInserts.push({
          game_id: session.gameId,
          firm_id: fd.firmId,
          round: gameConfig.current_round,
          state: {
            ...actual.nextStart,
            financials: actual.financials, // Store the full IS/BS for history
            roe: actual.financials.roe,
            netIncome: actual.financials.netIncome,
            revenue: actual.financials.revenue,
            usage: actual.usage,
            capacityCheck: actual.capacityCheck,
            limits: actual.limits
          },
          inventory_details: actual.inventoryDetails,
          efficiency: actual.nextEfficiency
        });
      }

      // 7. Handle non-submitting firms (carry forward state unchanged)
      const submittedIds = new Set(allDecisions.map(d => d.firm_id));
      for (const firm of firms) {
        if (!submittedIds.has(firm.id)) {
          const fs = firmStates[firm.id] || null;
          const baseState = fs?.state || gameConfig.setup;
          
          // Construct carry-forward financials if missing
          const financials = baseState.financials || {
             revenue: 0, netIncome: 0, roe: 0,
             cash: baseState.cash, equity: baseState.equity,
             totalAssets: baseState.totalAssets || (baseState.cash + (baseState.inventory || 0) + baseState.fixedAssets),
             stDebt: baseState.stDebt || 0, ltDebt: baseState.ltDebt || 0,
             retainedEarnings: baseState.retainedEarnings || 0
          };

          stateInserts.push({
            game_id: session.gameId,
            firm_id: firm.id,
            round: gameConfig.current_round,
            state: {
              ...baseState,
              financials: financials,
              roe: 0,
              netIncome: 0,
              revenue: 0
            },
            inventory_details: fs?.inventory_details || { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } },
            efficiency: fs?.efficiency || 0
          });
        }
      }

      // 8. Upsert firm states
      const { error: stateErr } = await supabase
        .from('firm_state')
        .upsert(stateInserts, { onConflict: 'game_id,firm_id,round' });
      if (stateErr) throw new Error('Failed to save firm states: ' + stateErr.message);

      // 9. Update market_data: convert Forecast→History, create new Forecast via AR(1)
      const { data: mktData } = await supabase
        .from('market_data')
        .select('*')
        .eq('game_id', session.gameId)
        .order('sort_order');

      for (const prod of ['A', 'B', 'C']) {
        const clearing = results[prod];

        // Convert current Forecast row to History with actual clearing data
        await supabase.from('market_data')
          .update({
            type: 'History',
            price: clearing.price,
            demand: clearing.qty,
            price_sd: null,
            demand_sd: null
          })
          .eq('game_id', session.gameId)
          .eq('product', prod)
          .eq('type', 'Forecast');

        // Build price/demand series for AR(1) forecast
        const hist = (mktData || []).filter(r => r.product === prod && r.type === 'History');
        const prices = hist.map(r => parseFloat(r.price));
        prices.push(clearing.price);
        const demands = hist.map(r => parseFloat(r.demand));
        demands.push(clearing.qty);

        const growth = gameConfig.parameters[prod]?.growth || 1.0;
        const pForecast = calculateAR1Forecast(prices, growth);
        const dForecast = calculateAR1Forecast(demands, growth);

        const maxOrder = hist.reduce((m, r) => Math.max(m, r.sort_order || 0), 0);

        await supabase.from('market_data').insert({
          game_id: session.gameId,
          product: prod,
          type: 'Forecast',
          year: `Y${gameConfig.current_round + 1}`,
          price: pForecast.mean,
          demand: dForecast.mean,
          price_sd: pForecast.sd,
          demand_sd: dForecast.sd,
          sort_order: maxOrder + 1
        });
      }

      // 10. Set round status to cleared
      await supabase.from('games').update({
        round_status: 'cleared'
      }).eq('id', session.gameId);

      // 11. Show results
      setClearingData(results);
      setMessage({
        type: 'success',
        text: `Round ${gameConfig.current_round} cleared!`
      });
      fetchGame();
    } catch (err) {
      console.error('Market clearing error:', err);
      setMessage({ type: 'error', text: `Clearing failed: ${err.message}` });
    } finally {
      setClearing(false);
    }
  };

  const resetGame = async () => {
    if (!confirm("DANGER: This will wipe ALL student decisions, history, and reset the game to Round 1. Are you sure?")) return;
    setClearing(true); // Re-use clearing loading state
    setMessage({ type: 'info', text: 'Resetting game...' });

    try {
      // 1. Reset Game Round
      await supabase.from('games').update({
        current_round: 1,
        round_status: 'setup'
      }).eq('id', session.gameId);

      // 2. Delete Decisions
      await supabase.from('decisions').delete().eq('game_id', session.gameId);

      // 3. Delete Firm State
      await supabase.from('firm_state').delete().eq('game_id', session.gameId);

      // 4. Delete & Re-seed Market Data
      await supabase.from('market_data').delete().eq('game_id', session.gameId);

      const marketInserts = [];
      let sortOrder = 1;
      ['A', 'B', 'C'].forEach(prod => {
        const scen = DEFAULT_SCENARIOS[prod];
        // History
        scen.history.forEach(h => {
          marketInserts.push({
            game_id: session.gameId,
            product: prod,
            type: 'History',
            year: h.year,
            price: h.price,
            demand: h.demand,
            sort_order: sortOrder++
          });
        });
        // Forecast
        marketInserts.push({
          game_id: session.gameId,
          product: prod,
          type: 'Forecast',
          year: scen.forecast.year,
          price: scen.forecast.price.mean,
          demand: scen.forecast.demand.mean,
          price_sd: scen.forecast.price.sd,
          demand_sd: scen.forecast.demand.sd,
          sort_order: sortOrder++
        });
      });
      await supabase.from('market_data').insert(marketInserts);

      // 5. Seed Round 0 Firm State
      const { data: gameData } = await supabase.from('games').select('setup').eq('id', session.gameId).single();
      const initialState = gameData.setup;

      // Ensure total assets is calculated if missing
      const totalAssets = (initialState.totalAssets) 
        ? initialState.totalAssets 
        : (initialState.cash + (initialState.inventory||0) + initialState.fixedAssets);

      // RESOLVE INVENTORY CONTRADICTION:
      // The setup has a value for inventory (e.g. 19200) but 0 units.
      // We move this value to Cash to ensure the BS balances while starting with 0 physical stock.
      const initialInventoryValue = initialState.inventory || 0;
      const adjustedCash = initialState.cash + initialInventoryValue;

      const seedStates = firms.map(f => ({
        game_id: session.gameId,
        firm_id: f.id,
        round: 0,
        state: {
            ...initialState,
            totalAssets, // Ensure this exists at top level if needed
            financials: {
                cash: adjustedCash,
                inventory: 0,
                fixedAssets: initialState.fixedAssets,
                totalAssets: totalAssets,
                stDebt: initialState.stDebt,
                ltDebt: initialState.ltDebt,
                equity: initialState.equity,
                retainedEarnings: initialState.retainedEarnings,
                revenue: 0,
                netIncome: 0,
                roe: 0,
                depreciation: 0,
                interest: 0,
                tax: 0,
                trainingExp: 0,
                varCost: 0,
                ebit: 0,
                grossProfit: 0,
                totalLiabEquity: initialState.stDebt + initialState.ltDebt + initialState.equity,
                inventoryUnitsA: 0,
                inventoryUnitsB: 0,
                inventoryUnitsC: 0
            },
            usage: { machine: 0, labour: 0 },
            capacityCheck: {
                machine: { used: 0, limit: initialState.limits?.machine || 1000, isOver: false },
                labour: { used: 0, limit: initialState.limits?.labour || 1000, isOver: false }
            },
            limits: initialState.limits || { machine: 1000, labour: 1000, material: 100000 }
        },
        inventory_details: { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} },
        efficiency: 0
      }));

      if (seedStates.length > 0) {
        await supabase.from('firm_state').insert(seedStates);
      }

      setMessage({ type: 'success', text: 'Game has been reset to Round 1.' });
      fetchGame();
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Reset failed: ' + err.message });
    } finally {
      setClearing(false);
    }
  };

  const canEditBalanceSheet = !game || game.current_round === 0 ||
    (game.current_round === 1 && game.round_status === 'setup');

  const saveSetup = async () => {
    if (!editSetup || !editRates) return;
    setSavingSetup(true);
    setMessage(null);
    try {
      const { error: gameErr } = await supabase
        .from('games')
        .update({ setup: editSetup, rates: editRates })
        .eq('id', session.gameId);
      if (gameErr) throw gameErr;

      if (firms.length > 0) {
        const initialInventoryValue = editSetup.inventory || 0;
        const adjustedCash = editSetup.cash + initialInventoryValue;
        const totalAssets = editSetup.cash + initialInventoryValue + editSetup.fixedAssets;

        const seedStates = firms.map(f => ({
          game_id: session.gameId,
          firm_id: f.id,
          round: 0,
          state: {
            ...editSetup,
            totalAssets,
            financials: {
              cash: adjustedCash,
              inventory: 0,
              fixedAssets: editSetup.fixedAssets,
              totalAssets,
              stDebt: editSetup.stDebt || 0,
              ltDebt: editSetup.ltDebt || 0,
              equity: editSetup.equity,
              retainedEarnings: editSetup.retainedEarnings,
              revenue: 0, netIncome: 0, roe: 0,
              depreciation: 0, interest: 0, tax: 0,
              trainingExp: 0, varCost: 0, ebit: 0, grossProfit: 0,
              totalLiabEquity: (editSetup.stDebt || 0) + (editSetup.ltDebt || 0) + editSetup.equity,
              inventoryUnitsA: 0, inventoryUnitsB: 0, inventoryUnitsC: 0
            },
            usage: { machine: 0, labour: 0 },
            capacityCheck: {
              machine: { used: 0, limit: editSetup.limits?.machine || 1000, isOver: false },
              labour: { used: 0, limit: editSetup.limits?.labour || 1000, isOver: false }
            },
            limits: editSetup.limits || { machine: 1000, labour: 1000, material: 100000 }
          },
          inventory_details: { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } },
          efficiency: 0
        }));

        const { error: stateErr } = await supabase
          .from('firm_state')
          .upsert(seedStates, { onConflict: 'game_id,firm_id,round' });
        if (stateErr) throw stateErr;
      }

      setMessage({ type: 'success', text: 'Balance sheet and rates saved.' + (firms.length > 0 ? ` Updated ${firms.length} firm(s).` : '') });
      fetchGame();
    } catch (err) {
      setMessage({ type: 'error', text: 'Save failed: ' + err.message });
    } finally {
      setSavingSetup(false);
    }
  };

  const saveParameters = async () => {
    if (!editParameters) return;
    setSavingParams(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('games')
        .update({ parameters: editParameters })
        .eq('id', session.gameId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Demand curve parameters saved. Changes will apply at the next market clearing.' });
      fetchGame();
    } catch (err) {
      setMessage({ type: 'error', text: 'Save failed: ' + err.message });
    } finally {
      setSavingParams(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4">
      {/* HEADER */}
      <header className="max-w-5xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            StratFi <span className="text-sm font-normal text-slate-400">| Instructor Dashboard</span>
          </h1>
          {game && (
            <div className="text-xs text-slate-500 mt-1">
              {game.name} &middot; Code: <span className="font-mono font-bold text-indigo-600">{game.join_code}</span>
              &middot; Round {game.current_round} ({game.round_status})
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md transition-all text-slate-400 hover:text-red-600 hover:bg-red-50"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {/* Message Banner */}
        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right font-bold">x</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-lg gap-1 border border-slate-200 shadow-sm w-fit">
          {[
            { key: 'roster', label: 'Firm Roster', icon: <Users className="w-4 h-4" /> },
            { key: 'round', label: 'Round Control', icon: <Play className="w-4 h-4" /> },
            { key: 'setup', label: 'Game Setup', icon: <Settings className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                tab === t.key ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Firm Roster */}
        {tab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-4">Firm Roster</h3>

            {/* Add Firm */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newFirmName ?? ''}
                onChange={(e) => setNewFirmName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFirm()}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="New firm name..."
              />
              <button
                onClick={addFirm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Firm
              </button>
            </div>

            {/* Firm Table */}
            {firms.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No firms yet. Add firms above.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="text-left p-2">Firm Name</th>
                    <th className="text-left p-2">PIN</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {firms.map(f => (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 font-medium">{f.name}</td>
                      <td className="p-2 font-mono text-indigo-600">
                        {f.pin}
                        <button
                          onClick={() => { navigator.clipboard.writeText(f.pin); }}
                          className="ml-2 text-slate-400 hover:text-indigo-600"
                          title="Copy PIN"
                        >
                          <Copy className="w-3 h-3 inline" />
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => deleteFirm(f.id, f.name)}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete firm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-4 text-xs text-slate-400">
              {firms.length} firm{firms.length !== 1 ? 's' : ''} registered.
              Share the game code <span className="font-mono font-bold text-indigo-600">{game?.join_code}</span> with students.
            </div>
          </div>
        )}

        {/* TAB: Round Control */}
        {tab === 'round' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-4">Round Control</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{game?.current_round || 0}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Current Round</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{game?.round_status || 'setup'}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Status</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {submissions.length} / {firms.length}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold">Submitted</div>
              </div>
            </div>

            {/* Submission Details */}
            {game?.round_status === 'open' || game?.round_status === 'closed' ? (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-600 mb-2">Submission Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {firms.map(f => {
                    const submitted = submissions.some(s => s.firm_id === f.id);
                    return (
                      <div key={f.id} className={`text-xs p-2 rounded-lg font-medium ${
                        submitted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {submitted ? '>' : '  '} {f.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Clearing Results */}
            {clearingData && (
              <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-indigo-800 mb-3">Clearing Results</h4>
                <div className="grid grid-cols-3 gap-4">
                  {['A', 'B', 'C'].map(p => (
                    <div key={p} className="bg-white rounded-lg p-3 text-center border border-indigo-100">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Product {p}</div>
                      <div className="text-lg font-bold text-indigo-700">${clearingData[p].price.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{clearingData[p].qty.toFixed(0)} units</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {(game?.round_status === 'setup' || game?.round_status === 'cleared') && game?.current_round < 3 && (
                <button
                  onClick={openRound}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Open Round {(game?.current_round || 0) + 1}
                </button>
              )}
              {game?.round_status === 'open' && (
                <button
                  onClick={closeSubmissions}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Square className="w-4 h-4" /> Close Submissions
                </button>
              )}
              {game?.round_status === 'closed' && (
                <button
                  onClick={clearMarket}
                  disabled={clearing}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> {clearing ? 'Clearing...' : 'Clear Market'}
                </button>
              )}
              <button
                onClick={() => { fetchGame(); fetchSubmissions(); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              
              <div className="flex-1"></div> {/* Spacer */}
              
              <button
                onClick={resetGame}
                disabled={clearing}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset Game
              </button>
            </div>

            {game?.current_round >= 3 && game?.round_status === 'cleared' && (
              <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-indigo-900">Game Complete</div>
                <div className="text-sm text-indigo-700">All 3 rounds have been played.</div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Game Setup */}
        {tab === 'setup' && (
          <div className="space-y-6">
            <BalanceSheetEditor
              setup={editSetup || game?.setup || { cash: 29200, fixedAssets: 20000, stDebt: 0, ltDebt: 0, equity: 30000, retainedEarnings: 19200, limits: { machine: 1000, labour: 1000 } }}
              rates={editRates || game?.rates || { st: 10.0, lt: 5.0, tax: 30.0 }}
              onSetupChange={setEditSetup}
              onRatesChange={setEditRates}
              onSave={saveSetup}
              saving={savingSetup}
              disabled={!canEditBalanceSheet}
              firmCount={firms.length}
            />
            <DemandCurveEditor
              parameters={editParameters || game?.parameters}
              onParametersChange={setEditParameters}
              onSave={saveParameters}
              saving={savingParams}
              currentRound={game?.current_round || 0}
              roundStatus={game?.round_status || 'setup'}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
