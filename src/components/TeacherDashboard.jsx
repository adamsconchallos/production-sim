import { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  LogOut, 
  Plus, 
  Users, 
  Play, 
  Square, 
  Zap, 
  RefreshCw, 
  Trash2, 
  Copy, 
  RotateCcw, 
  Settings, 
  Trophy, 
  Banknote,
  LayoutGrid,
  ChevronLeft,
  Calendar,
  Key,
  Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearMarket as runClearMarket, computeFirmActualResults, calculateAR1Forecast } from '../engine/marketClearing';
import { DEFAULT_SCENARIOS } from '../constants/defaults';
import { useInstructorLeaderboard } from '../hooks/useInstructorLeaderboard';
import BalanceSheetEditor from './teacher/BalanceSheetEditor';
import DemandCurveEditor from './teacher/DemandCurveEditor';
import LoanReviewPanel from './teacher/LoanReviewPanel';
import InstructorLeaderboard from './InstructorLeaderboard';
import Footer from './ui/Footer';

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const TeacherDashboard = ({ session, logout }) => {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  // 1. Fetch instructor's games
  const fetchGames = useCallback(async () => {
    if (!supabase || !session?.userId) return;
    setLoadingGames(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, name, join_code, current_round, round_status, created_at')
        .eq('teacher_id', session.userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoadingGames(false);
    }
  }, [session]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // 2. Create new game
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!newGameName.trim()) return;

    try {
      const joinCode = generateJoinCode();
      const { data, error } = await supabase
        .from('games')
        .insert({
          name: newGameName.trim(),
          teacher_id: session.userId,
          join_code: joinCode,
          teacher_pin: '0000', // Legacy field, can be anything
          current_round: 1,
          round_status: 'setup',
          max_rounds: 3,
          setup: { 
            cash: 29200, 
            fixedAssets: 20000, 
            stDebt: 0, 
            ltDebt: 0, 
            equity: 30000, 
            retainedEarnings: 19200, 
            limits: { machine: 1000, labour: 1000, material: 100000 } 
          },
          rates: { st: 10.0, lt: 5.0, tax: 30.0 },
          parameters: {
            A: { growth: 1.0, sensitivity: 0.5 },
            B: { growth: 1.0, sensitivity: 0.5 },
            C: { growth: 1.0, sensitivity: 0.5 }
          }
        })
        .select()
        .single();

      if (error) throw error;
      
      // Seed initial market data for the new game
      const marketInserts = [];
      let sortOrder = 1;
      ['A', 'B', 'C'].forEach(prod => {
        const scen = DEFAULT_SCENARIOS[prod];
        scen.history.forEach(h => {
          marketInserts.push({
            game_id: data.id,
            product: prod,
            type: 'History',
            year: h.year,
            price: h.price,
            demand: h.demand,
            sort_order: sortOrder++
          });
        });
        marketInserts.push({
          game_id: data.id,
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

      setNewGameName('');
      setShowCreateForm(false);
      fetchGames();
      setSelectedGameId(data.id);
    } catch (err) {
      alert("Failed to create game: " + err.message);
    }
  };

  // 3. Render Game List or Game Detail
  if (!selectedGameId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-indigo-600" />
              StratFi Instructor
            </h1>
            <p className="text-slate-500">Welcome back, {session.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        <main className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" /> Your Games
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Game
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-md mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-bold text-indigo-900 mb-4">Launch New Simulation</h3>
              <form onSubmit={handleCreateGame} className="flex gap-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="Game Name (e.g., Spring 2026 Section A)"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">
                  Create Game
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {loadingGames ? (
            <div className="py-12 text-center text-slate-400">Loading your games...</div>
          ) : games.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No games found</h3>
              <p className="text-slate-500 mb-6">You haven't created any simulations yet. Click the button above to start.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGameId(g.id)}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 text-left transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{g.name}</h3>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      g.round_status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {g.round_status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Key className="w-3.5 h-3.5" /> Join Code: <span className="font-mono font-bold text-indigo-600">{g.join_code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Play className="w-3.5 h-3.5" /> Round: <span className="font-bold text-slate-700">{g.current_round}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> Created: {new Date(g.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // If a game is selected, show the management dashboard
  return (
    <GameManagement 
      gameId={selectedGameId} 
      session={session} 
      onBack={() => setSelectedGameId(null)} 
      logout={logout}
    />
  );
};

// --- Sub-Component: Game Management ---
function GameManagement({ gameId, session, onBack, logout }) {
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

  // Leaderboard Data
  const { leaderboard, loading: loadingLeaderboard, refresh: refreshLeaderboard } = useInstructorLeaderboard(gameId);

  const fetchGame = useCallback(async () => {
    if (!supabase || !gameId) return;
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
    if (data) {
      setGame(data);
      setEditSetup(data.setup);
      setEditRates(data.rates);
      setEditParameters(data.parameters);
    }
  }, [gameId]);

  const fetchFirms = useCallback(async () => {
    if (!supabase || !gameId) return;
    const { data } = await supabase
      .from('firms')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at');
    if (data) setFirms(data);
  }, [gameId]);

  const fetchSubmissions = useCallback(async (currentGame) => {
    if (!supabase || !gameId) return;
    const round = currentGame?.current_round ?? game?.current_round;
    if (round == null) return;
    const { data } = await supabase
      .from('decisions')
      .select('firm_id, round, submitted_at')
      .eq('game_id', gameId)
      .eq('round', round);
    if (data) setSubmissions(data);
  }, [gameId, game]);

  // Load all data on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || !gameId) { setLoading(false); return; }
      const { data: gameData } = await supabase
        .from('games').select('*').eq('id', gameId).single();
      if (cancelled) return;
      if (gameData) {
        setGame(gameData);
        setEditSetup(gameData.setup);
        setEditRates(gameData.rates);
        setEditParameters(gameData.parameters);
        const { data: firmsData } = await supabase
          .from('firms').select('*').eq('game_id', gameId).order('created_at');
        if (!cancelled && firmsData) setFirms(firmsData);
        const { data: subsData } = await supabase
          .from('decisions').select('firm_id, round, submitted_at')
          .eq('game_id', gameId).eq('round', gameData.current_round);
        if (!cancelled && subsData) setSubmissions(subsData);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [gameId]);

  // --- ACTIONS ---
  const addFirm = async () => {
    if (!newFirmName.trim()) return;
    const pin = generatePin();
    const { error } = await supabase.from('firms').insert({
      game_id: gameId,
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const rows = content.split(/\r?\n/).filter(row => row.trim());
      if (rows.length < 2) {
        setMessage({ type: 'error', text: 'CSV is empty or missing data.' });
        return;
      }

      const parseCSVLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else cur += char;
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseCSVLine(rows[0]).map(h => h.toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('firm') && h.includes('name'));
      const pinIdx = headers.findIndex(h => h.includes('pin'));
      const studentsIdx = headers.findIndex(h => h.includes('student'));

      if (nameIdx === -1) {
        setMessage({ type: 'error', text: 'CSV must have a "Firm name" column.' });
        return;
      }

      const firmsToInsert = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = parseCSVLine(rows[i]);
        if (cols.length < headers.length || !cols[nameIdx]) continue;

        firmsToInsert.push({
          game_id: gameId,
          name: cols[nameIdx],
          pin: (pinIdx !== -1 && cols[pinIdx]) ? cols[pinIdx] : generatePin(),
          students: (studentsIdx !== -1 && cols[studentsIdx]) ? cols[studentsIdx] : null
        });
      }

      if (firmsToInsert.length === 0) {
        setMessage({ type: 'error', text: 'No valid firms found in CSV.' });
        return;
      }

      const { error } = await supabase.from('firms').insert(firmsToInsert);
      if (error) {
        setMessage({ type: 'error', text: 'Upload failed: ' + error.message });
      } else {
        setMessage({ type: 'success', text: `Successfully imported ${firmsToInsert.length} firms.` });
        fetchFirms();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadExampleCSV = () => {
    const headers = "Firm name,pin,students in the group";
    const exampleRow = '"Example Firm",1234,"Student A, Student B"';
    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'firms_example.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteFirm = async (firmId, firmName) => {
    if (!confirm(`Delete firm "${firmName}"? This will remove all their data.`)) return;
    await supabase.from('firms').delete().eq('id', firmId);
    fetchFirms();
  };

  const openRound = async () => {
    const nextRound = (game.current_round || 0) + 1;
    const maxRounds = game.max_rounds || 3;
    if (nextRound > maxRounds) {
      setMessage({ type: 'error', text: `Game is complete (${maxRounds} rounds played).` });
      return;
    }
    await supabase.from('games').update({
      current_round: nextRound,
      round_status: 'open'
    }).eq('id', gameId);
    setMessage({ type: 'success', text: `Round ${nextRound} is now open for submissions.` });
    fetchGame();
  };

  const closeSubmissions = async () => {
    await supabase.from('games').update({
      round_status: 'closed'
    }).eq('id', gameId);
    setMessage({ type: 'success', text: 'Submissions closed. Please review loans.' });
    setTab('loans'); // Switch to loan review
    fetchGame();
  };

  const publishLoans = async () => {
      const { error } = await supabase.from('games').update({
          round_status: 'loans_reviewed'
      }).eq('id', gameId);

      if (error) {
          setMessage({ type: 'error', text: 'Failed to publish: ' + error.message });
          return;
      }

      setGame(prev => ({ ...prev, round_status: 'loans_reviewed' }));
      setMessage({ type: 'success', text: 'Loans published. Students can see status. You can now clear the market.' });
      setTab('round');
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
        .eq('id', gameId)
        .single();
      if (gcErr || !gameConfig) throw new Error('Could not load game config');

      // 2. Fetch all decisions for current round
      const { data: allDecisions, error: decErr } = await supabase
        .from('decisions')
        .select('firm_id, data')
        .eq('game_id', gameId)
        .eq('round', gameConfig.current_round);
      if (decErr) throw new Error('Could not load decisions');

      if (!allDecisions || allDecisions.length === 0) {
        throw new Error('No decisions submitted for this round');
      }

      // 2a. Fetch APPROVED Loan Requests
      const { data: loanRequests, error: loanErr } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('game_id', gameId)
        .eq('round', gameConfig.current_round);
      if (loanErr) throw loanErr;

      const firmLoans = {}; // firmId -> { st: {amount, rate}, lt: {amount, rate} }
      loanRequests?.forEach(r => {
          if (!firmLoans[r.firm_id]) firmLoans[r.firm_id] = { st: null, lt: null };
          // Only process if status is approved or partial
          if (r.status === 'approved' || r.status === 'partial') {
              firmLoans[r.firm_id][r.loan_type.toLowerCase()] = {
                  amount: parseFloat(r.approved_amount) || 0,
                  rate: parseFloat(r.approved_rate) || (r.loan_type === 'ST' ? gameConfig.rates.st : gameConfig.rates.lt)
              };
          } else {
              // Denied or Pending (unreviewed) -> 0 amount
               firmLoans[r.firm_id][r.loan_type.toLowerCase()] = {
                  amount: 0,
                  rate: r.loan_type === 'ST' ? gameConfig.rates.st : gameConfig.rates.lt
              };
          }
      });


      // 3. Fetch firm states from previous round (or initial for round 1)
      const prevRound = gameConfig.current_round - 1;
      const firmStates = {};
      if (prevRound >= 0) {
        const { data: states } = await supabase
          .from('firm_state')
          .select('firm_id, state, inventory_details, efficiency')
          .eq('game_id', gameId)
          .eq('round', prevRound);
        if (states) states.forEach(s => { firmStates[s.firm_id] = s; });
      }

      // 4. Prepare firm decisions (Apply limits & Overwrite Loans)
      const firmDecisions = allDecisions.map(d => {
        // Clone decision
        const data = JSON.parse(JSON.stringify(d.data));
        
        // OVERRIDE LOANS with Approved Amounts
        const loans = firmLoans[d.firm_id];
        if (loans) {
            if (loans.st) data.finance.newST = loans.st.amount;
            if (loans.lt) data.finance.newLT = loans.lt.amount;
        } else {
            // No loan requests found for this firm? Means 0 requested.
            data.finance.newST = 0;
            data.finance.newLT = 0;
        }

        return {
            firmId: d.firm_id,
            data
        };
      });

      // Cap sales to available (ROBUST VERSION)
      for (const fd of firmDecisions) {
        const fs = firmStates[fd.firmId];
        const invDetails = fs?.inventory_details
          || { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } };
        ['A', 'B', 'C'].forEach(p => {
          const prodQty = Number(fd.data.qty[p]) || 0;
          const invUnits = Number(invDetails[p]?.units) || 0;
          const offeredSales = Number(fd.data.sales[p]) || 0;
          const available = prodQty + invUnits;
          
          if (offeredSales > available) {
            fd.data.sales[p] = available;
          } else {
            fd.data.sales[p] = offeredSales;
          }
          // Ensure prices are numbers too
          fd.data.price[p] = Number(fd.data.price[p]) || 0;
        });
      }

      // 5. Run market clearing algorithm
      const results = runClearMarket(gameConfig.parameters, firmDecisions);

      // 6. Compute actual results for each submitting firm
      const stateInserts = [];
      for (const fd of firmDecisions) {
        const fs = firmStates[fd.firmId] || null;
        
        // Build approvedLoans object for interest calc
        const loans = firmLoans[fd.firmId];
        const approvedLoansObj = loans ? {
            st: loans.st ? { rate: loans.st.rate } : null,
            lt: loans.lt ? { rate: loans.lt.rate } : null
        } : null;

        const actual = computeFirmActualResults(
          fd.data, results, fs, gameConfig.setup, gameConfig.rates, approvedLoansObj
        );
        stateInserts.push({
          game_id: gameId,
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
          
          const financials = baseState.financials || {
             revenue: 0, netIncome: 0, roe: 0,
             cash: baseState.cash, equity: baseState.equity,
             totalAssets: baseState.totalAssets || (baseState.cash + (baseState.inventory || 0) + baseState.fixedAssets),
             stDebt: baseState.stDebt || 0, ltDebt: baseState.ltDebt || 0,
             retainedEarnings: baseState.retainedEarnings || 0
          };

          stateInserts.push({
            game_id: gameId,
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

      // 9. Update market_data
      const { data: mktData } = await supabase
        .from('market_data')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order');

      for (const prod of ['A', 'B', 'C']) {
        const clearing = results[prod];

        await supabase.from('market_data')
          .update({
            type: 'History',
            price: clearing.price,
            demand: clearing.qty,
            price_sd: null,
            demand_sd: null
          })
          .eq('game_id', gameId)
          .eq('product', prod)
          .eq('type', 'Forecast');

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
          game_id: gameId,
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
      }).eq('id', gameId);

      // 11. Show results
      setClearingData(results);
      setMessage({
        type: 'success',
        text: `Round ${gameConfig.current_round} cleared!`
      });
      fetchGame();
      refreshLeaderboard();
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
      await supabase.from('games').update({
        current_round: 1,
        round_status: 'setup'
      }).eq('id', gameId);

      await supabase.from('decisions').delete().eq('game_id', gameId);
      await supabase.from('firm_state').delete().eq('game_id', gameId);
      await supabase.from('loan_requests').delete().eq('game_id', gameId);
      await supabase.from('market_data').delete().eq('game_id', gameId);

      const marketInserts = [];
      let sortOrder = 1;
      ['A', 'B', 'C'].forEach(prod => {
        const scen = DEFAULT_SCENARIOS[prod];
        scen.history.forEach(h => {
          marketInserts.push({
            game_id: gameId,
            product: prod,
            type: 'History',
            year: h.year,
            price: h.price,
            demand: h.demand,
            sort_order: sortOrder++
          });
        });
        marketInserts.push({
          game_id: gameId,
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

      const { data: gameData } = await supabase.from('games').select('setup').eq('id', gameId).single();
      const initialState = gameData.setup;

      const totalAssets = (initialState.totalAssets) 
        ? initialState.totalAssets 
        : (initialState.cash + (initialState.inventory||0) + initialState.fixedAssets);

      const initialInventoryValue = initialState.inventory || 0;
      const adjustedCash = initialState.cash + initialInventoryValue;

      const seedStates = firms.map(f => ({
        game_id: gameId,
        firm_id: f.id,
        round: 0,
        state: {
            ...initialState,
            totalAssets,
            financials: {
                cash: adjustedCash,
                inventory: 0,
                fixedAssets: initialState.fixedAssets,
                totalAssets: totalAssets,
                stDebt: initialState.stDebt,
                ltDebt: initialState.ltDebt,
                equity: initialState.equity,
                retainedEarnings: initialState.retainedEarnings,
                revenue: 0, netIncome: 0, roe: 0,
                depreciation: 0, interest: 0, tax: 0, trainingExp: 0, varCost: 0, ebit: 0, grossProfit: 0,
                totalLiabEquity: initialState.stDebt + initialState.ltDebt + initialState.equity,
                inventoryUnitsA: 0, inventoryUnitsB: 0, inventoryUnitsC: 0
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
      refreshLeaderboard();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Reset failed: ' + err.message });
    } finally {
      setClearing(false);
    }
  };

  const saveSetup = async () => {
    if (!editSetup || !editRates) return;
    setSavingSetup(true);
    setMessage(null);
    try {
      const { error: gameErr } = await supabase
        .from('games')
        .update({ setup: editSetup, rates: editRates, max_rounds: game.max_rounds })
        .eq('id', gameId);
      if (gameErr) throw gameErr;

      if (firms.length > 0) {
        const initialInventoryValue = editSetup.inventory || 0;
        const adjustedCash = editSetup.cash + initialInventoryValue;
        const totalAssets = editSetup.cash + initialInventoryValue + editSetup.fixedAssets;

        const seedStates = firms.map(f => ({
          game_id: gameId,
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
              depreciation: 0, interest: 0, tax: 0, trainingExp: 0, varCost: 0, ebit: 0, grossProfit: 0,
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

      setMessage({ type: 'success', text: 'Balance sheet and rates saved.' });
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
        .eq('id', gameId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Demand curve parameters saved.' });
      fetchGame();
    } catch (err) {
      setMessage({ type: 'error', text: 'Save failed: ' + err.message });
    } finally {
      setSavingParams(false);
    }
  };

  const deleteGame = async () => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete this game: "${game.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
      onBack();
    } catch (err) {
      alert("Failed to delete game: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading simulation details...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* HEADER */}
      <header className="max-w-5xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{game?.name}</h1>
            <div className="text-xs text-slate-500">
              Join Code: <span className="font-mono font-bold text-indigo-600">{game?.join_code}</span> &middot; Round {game?.current_round} ({game?.round_status})
            </div>
          </div>
        </div>
        <button onClick={logout} className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium border ${
            message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right font-bold">x</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-lg gap-1 border border-slate-200 shadow-sm w-fit">
          {[
            { key: 'roster', label: 'Roster', icon: <Users className="w-4 h-4" /> },
            { key: 'round', label: 'Control', icon: <Play className="w-4 h-4" /> },
            { key: 'loans', label: 'Loans', icon: <Banknote className="w-4 h-4" />, disabled: !(game?.round_status === 'closed' || game?.round_status === 'loans_reviewed') },
            { key: 'leaderboard', label: 'Ranking', icon: <Trophy className="w-4 h-4" /> },
            { key: 'setup', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          ].map(t => !t.disabled && (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${tab === t.key ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Firm Roster</h3>
              <div className="flex gap-2 items-center">
                <button
                  onClick={downloadExampleCSV}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                >
                  Download Example
                </button>
                <input
                  type="file"
                  id="csv-upload"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload CSV
                </label>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <input type="text" value={newFirmName} onChange={(e) => setNewFirmName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFirm()} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" placeholder="New firm name..." />
              <button onClick={addFirm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Add Firm</button>
            </div>
            {firms.length === 0 ? <p className="text-slate-400 text-sm text-center py-8">No firms yet.</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="text-left p-2">Firm Name</th>
                    <th className="text-left p-2">Students</th>
                    <th className="text-left p-2">PIN</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>{firms.map(f => (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 font-medium">{f.name}</td>
                    <td className="p-2 text-slate-500 max-w-xs truncate" title={f.students}>{f.students || '-'}</td>
                    <td className="p-2 font-mono text-indigo-600">{f.pin} <button onClick={() => navigator.clipboard.writeText(f.pin)} className="ml-2 text-slate-400 hover:text-indigo-600"><Copy className="w-3 h-3 inline" /></button></td>
                    <td className="p-2 text-right"><button onClick={() => deleteFirm(f.id, f.name)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'round' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-2xl font-bold text-slate-900">{game?.current_round}</div><div className="text-[10px] text-slate-500 uppercase font-bold">Round</div></div>
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-2xl font-bold text-slate-900 capitalize">{game?.round_status}</div><div className="text-[10px] text-slate-500 uppercase font-bold">Status</div></div>
              <div className="bg-slate-50 rounded-lg p-4"><div className="text-2xl font-bold text-slate-900">{submissions.length} / {firms.length}</div><div className="text-[10px] text-slate-500 uppercase font-bold">Submitted</div></div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {(game?.round_status === 'setup' || game?.round_status === 'cleared') && game?.current_round < game?.max_rounds && (
                <button onClick={openRound} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><Play className="w-4 h-4" /> Open Round {game?.current_round + 1}</button>
              )}
              {game?.round_status === 'open' && (
                <button onClick={closeSubmissions} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><Square className="w-4 h-4" /> Close Submissions</button>
              )}
              {game?.round_status === 'loans_reviewed' && (
                <button onClick={clearMarket} disabled={clearing} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><Zap className="w-4 h-4" /> {clearing ? 'Clearing...' : 'Clear Market'}</button>
              )}
              <button onClick={() => { fetchGame(); fetchSubmissions(); refreshLeaderboard(); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-lg font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
              <div className="flex-1"></div>
              <button onClick={resetGame} disabled={clearing} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-3 rounded-lg font-bold flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset Game</button>
            </div>
          </div>
        )}

        {tab === 'loans' && <LoanReviewPanel gameId={gameId} currentRound={game?.current_round} firms={firms} onPublish={publishLoans} />}
        {tab === 'leaderboard' && <InstructorLeaderboard leaderboard={leaderboard} loading={loadingLeaderboard} currentRound={game?.current_round} />}
        {tab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-700 mb-4">Game Parameters</h3>
              <div className="flex items-center gap-8">
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Rounds</label><input type="number" value={game?.max_rounds} onChange={(e) => setGame(prev => ({ ...prev, max_rounds: parseInt(e.target.value) || 1 }))} className="w-24 border border-slate-300 rounded p-2 outline-none focus:border-indigo-500" /></div>
                <div className="flex-1 text-right text-xs text-slate-400">Join Code: <span className="font-mono font-bold text-indigo-600 select-all">{game?.join_code}</span></div>
              </div>
            </div>
            <BalanceSheetEditor setup={editSetup || game?.setup} rates={editRates || game?.rates} onSetupChange={setEditSetup} onRatesChange={setEditRates} onSave={saveSetup} saving={savingSetup} disabled={game?.current_round > 1} firmCount={firms.length} />
            <DemandCurveEditor parameters={editParameters || game?.parameters} onParametersChange={setEditParameters} onSave={saveParameters} saving={savingParams} currentRound={game?.current_round} roundStatus={game?.round_status} />
            <div className="pt-10 border-t border-slate-200 flex justify-end">
              <button onClick={deleteGame} className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete This Entire Game</button>
            </div>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}

export default TeacherDashboard;