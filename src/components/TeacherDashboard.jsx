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
  Upload,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clearMarket as runClearMarket, computeFirmActualResults, calculateAR1Forecast } from '../engine/marketClearing';
import { DEFAULT_SCENARIOS } from '../constants/defaults';
import { useInstructorLeaderboard } from '../hooks/useInstructorLeaderboard';
import { useMarketData } from '../hooks/useMarketData';
import BalanceSheetEditor from './teacher/BalanceSheetEditor';
import DemandCurveEditor from './teacher/DemandCurveEditor';
import LoanReviewPanel from './teacher/LoanReviewPanel';
import SupplyCurveChart from './teacher/SupplyCurveChart';
import InstructorLeaderboard from './InstructorLeaderboard';
import MarketBrief from './MarketBrief';
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
          teacher_pin: '0000',
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

  return (
    <GameManagement 
      gameId={selectedGameId} 
      session={session} 
      onBack={() => setSelectedGameId(null)} 
      logout={logout}
    />
  );
};

function GameManagement({ gameId, session, onBack, logout }) {
  const [game, setGame] = useState(null);
  const [firms, setFirms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('roster');
  const [supplyTab, setSupplyTab] = useState('A');
  const [newFirmName, setNewFirmName] = useState('');
  const [message, setMessage] = useState(null);
  const [clearingData, setClearingData] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [editSetup, setEditSetup] = useState(null);
  const [editRates, setEditRates] = useState(null);
  const [editParameters, setEditParameters] = useState(null);
  const [savingSetup, setSavingSetup] = useState(false);
  const [savingParams, setSavingParams] = useState(false);

  const { leaderboard, loading: loadingLeaderboard, refresh: refreshLeaderboard } = useInstructorLeaderboard(gameId);
  const { scenarios, isLoadingData, usingDefaults, fetchMarketData } = useMarketData(gameId);

  const fetchGame = useCallback(async () => {
    if (!supabase || !gameId) return;
    const { data } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (data) {
      setGame(data);
      setEditSetup(data.setup);
      setEditRates(data.rates);
      setEditParameters(data.parameters);
    }
  }, [gameId]);

  const fetchFirms = useCallback(async () => {
    if (!supabase || !gameId) return;
    const { data } = await supabase.from('firms').select('*').eq('game_id', gameId).order('created_at');
    if (data) setFirms(data);
  }, [gameId]);

  const fetchSubmissions = useCallback(async (currentGame) => {
    if (!supabase || !gameId) return;
    const round = currentGame?.current_round ?? game?.current_round;
    if (round == null) return;
    const { data } = await supabase.from('decisions').select('firm_id, round, submitted_at, data').eq('game_id', gameId).eq('round', round);
    if (data) setSubmissions(data);
  }, [gameId, game]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || !gameId) { setLoading(false); return; }
      const { data: gameData } = await supabase.from('games').select('*').eq('id', gameId).single();
      if (cancelled) return;
      if (gameData) {
        setGame(gameData);
        setEditSetup(gameData.setup);
        setEditRates(gameData.rates);
        setEditParameters(gameData.parameters);
        const { data: firmsData } = await supabase.from('firms').select('*').eq('game_id', gameId).order('created_at');
        if (!cancelled && firmsData) setFirms(firmsData);
        const { data: subsData } = await supabase.from('decisions').select('firm_id, round, submitted_at, data').eq('game_id', gameId).eq('round', gameData.current_round);
        if (!cancelled && subsData) setSubmissions(subsData);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [gameId]);

  const addFirm = async () => {
    if (!newFirmName.trim()) return;
    const pin = generatePin();
    const { error } = await supabase.from('firms').insert({ game_id: gameId, name: newFirmName.trim(), pin });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: `Firm created with PIN: ${pin}` });
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
      if (rows.length < 2) return;
      const parseCSVLine = (line) => {
        const result = []; let cur = ''; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
          else cur += char;
        }
        result.push(cur.trim()); return result;
      };
      const headers = parseCSVLine(rows[0]).map(h => h.toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('firm') && h.includes('name'));
      const pinIdx = headers.findIndex(h => h.includes('pin'));
      const studentsIdx = headers.findIndex(h => h.includes('student'));
      if (nameIdx === -1) return;
      const firmsToInsert = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = parseCSVLine(rows[i]);
        if (cols.length < headers.length || !cols[nameIdx]) continue;
        firmsToInsert.push({ game_id: gameId, name: cols[nameIdx], pin: (pinIdx !== -1 && cols[pinIdx]) ? cols[pinIdx] : generatePin(), students: (studentsIdx !== -1 && cols[studentsIdx]) ? cols[studentsIdx] : null });
      }
      if (firmsToInsert.length === 0) return;
      const { error } = await supabase.from('firms').insert(firmsToInsert);
      if (!error) fetchFirms();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadExampleCSV = () => {
    const csvContent = "Firm name,pin,students in the group\n\"Example Firm\",1234,\"Student A, Student B\"";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url); a.setAttribute('download', 'firms_example.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const deleteFirm = async (firmId, firmName) => {
    if (!confirm(`Delete firm "${firmName}"?`)) return;
    await supabase.from('firms').delete().eq('id', firmId);
    fetchFirms();
  };

  const openRound = async () => {
    const nextRound = (game.current_round || 0) + 1;
    await supabase.from('games').update({ current_round: nextRound, round_status: 'open' }).eq('id', gameId);
    fetchGame();
  };

  const closeSubmissions = async () => {
    await supabase.from('games').update({ round_status: 'closed' }).eq('id', gameId);
    setTab('loans');
    fetchGame();
  };

  const publishLoans = async () => {
    await supabase.from('games').update({ round_status: 'loans_reviewed' }).eq('id', gameId);
    fetchGame();
  };

  const clearMarket = async () => {
    setClearing(true);
    try {
      const { data: gameConfig } = await supabase.from('games').select('*').eq('id', gameId).single();
      const { data: allDecisions } = await supabase.from('decisions').select('*').eq('game_id', gameId).eq('round', gameConfig.current_round);
      const { data: loanRequests } = await supabase.from('loan_requests').select('*').eq('game_id', gameId).eq('round', gameConfig.current_round);
      
      const firmLoans = {};
      loanRequests?.forEach(r => {
        if (!firmLoans[r.firm_id]) firmLoans[r.firm_id] = { st: null, lt: null };
        if (r.status === 'approved' || r.status === 'partial') {
          firmLoans[r.firm_id][r.loan_type.toLowerCase()] = { amount: parseFloat(r.approved_amount) || 0, rate: parseFloat(r.approved_rate) || (r.loan_type === 'ST' ? gameConfig.rates.st : gameConfig.rates.lt) };
        }
      });

      const { data: prevStates } = await supabase.from('firm_state').select('*').eq('game_id', gameId).eq('round', gameConfig.current_round - 1);
      const firmStates = {}; prevStates?.forEach(s => { firmStates[s.firm_id] = s; });

      const firmDecisions = allDecisions.map(d => {
        const data = JSON.parse(JSON.stringify(d.data));
        const loans = firmLoans[d.firm_id];
        if (loans) { if (loans.st) data.finance.newST = loans.st.amount; if (loans.lt) data.finance.newLT = loans.lt.amount; }
        return { firmId: d.firm_id, data };
      });

      const results = runClearMarket(gameConfig.parameters, firmDecisions);
      const stateInserts = [];
      for (const fd of firmDecisions) {
        const fs = firmStates[fd.firmId] || null;
        const actual = computeFirmActualResults(fd.data, results, fs, gameConfig.setup, gameConfig.rates, firmLoans[fd.firmId]);
        stateInserts.push({ game_id: gameId, firm_id: fd.firmId, round: gameConfig.current_round, state: { ...actual.nextStart, financials: actual.financials, roe: actual.financials.roe, netIncome: actual.financials.netIncome, revenue: actual.financials.revenue, usage: actual.usage, capacityCheck: actual.capacityCheck, limits: actual.limits }, inventory_details: actual.inventoryDetails, efficiency: actual.nextEfficiency });
      }

      await supabase.from('firm_state').upsert(stateInserts, { onConflict: 'game_id,firm_id,round' });
      await supabase.from('games').update({ round_status: 'cleared' }).eq('id', gameId);
      fetchGame();
      refreshLeaderboard();
    } catch (err) { console.error(err); } finally { setClearing(false); }
  };

  const resetGame = async () => {
    if (!confirm("Reset game?")) return;
    await supabase.from('games').update({ current_round: 1, round_status: 'setup' }).eq('id', gameId);
    await supabase.from('decisions').delete().eq('game_id', gameId);
    await supabase.from('firm_state').delete().eq('game_id', gameId);
    fetchGame();
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <header className="max-w-5xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{game?.name}</h1>
            <div className="text-xs text-slate-500">Code: <span className="font-mono font-bold text-indigo-600">{game?.join_code}</span> &middot; Round {game?.current_round}</div>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="flex bg-white p-1 rounded-lg gap-1 border border-slate-200 shadow-sm w-fit">
          {[{key:'roster',label:'Roster',icon:<Users className="w-4 h-4"/>},{key:'brief',label:'Brief',icon:<TrendingUp className="w-4 h-4"/>},{key:'round',label:'Control',icon:<Play className="w-4 h-4"/>},{key:'loans',label:'Loans',icon:<Banknote className="w-4 h-4"/>,disabled:!(game?.round_status==='closed'||game?.round_status==='loans_reviewed')},{key:'leaderboard',label:'Ranking',icon:<Trophy className="w-4 h-4"/>},{key:'setup',label:'Settings',icon:<Settings className="w-4 h-4"/>}].map(t => !t.disabled && (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${tab === t.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>{t.icon} {t.label}</button>
          ))}
        </div>

        {tab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Firm Roster</h3>
              <div className="flex gap-2">
                <button onClick={downloadExampleCSV} className="text-xs text-indigo-600 underline">Example</button>
                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />
                <label htmlFor="csv-upload" className="cursor-pointer bg-slate-100 px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><Upload className="w-3 h-3"/> Upload</label>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <input type="text" value={newFirmName} onChange={e => setNewFirmName(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" placeholder="New firm name..." />
              <button onClick={addFirm} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Add</button>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-slate-500 text-xs uppercase"><th className="text-left p-2">Name</th><th className="text-left p-2">Students</th><th className="text-left p-2">PIN</th><th className="text-right p-2">Actions</th></tr></thead>
              <tbody>{firms.map(f => (
                <tr key={f.id} className="border-b hover:bg-slate-50"><td className="p-2 font-medium">{f.name}</td><td className="p-2 text-slate-500">{f.students || '-'}</td><td className="p-2 font-mono text-indigo-600">{f.pin}</td><td className="p-2 text-right"><button onClick={() => deleteFirm(f.id, f.name)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'brief' && <MarketBrief scenarios={scenarios} loading={isLoadingData} usingDefaults={usingDefaults} onRefresh={fetchMarketData} />}

        {tab === 'round' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-slate-50 p-4 rounded">Round<div className="text-2xl font-bold">{game?.current_round}</div></div>
              <div className="bg-slate-50 p-4 rounded">Status<div className="text-2xl font-bold capitalize">{game?.round_status}</div></div>
              <div className="bg-slate-50 p-4 rounded">Submissions<div className="text-2xl font-bold">{submissions.length} / {firms.length}</div></div>
            </div>
            {submissions.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between mb-4"><h4 className="font-bold">Supply Curve</h4><div className="flex gap-1">{['A','B','C'].map(p => <button key={p} onClick={() => setSupplyTab(p)} className={`px-3 py-1 rounded text-xs ${supplyTab===p?'bg-indigo-600 text-white':'bg-slate-100'}`}>Product {p}</button>)}</div></div>
                <SupplyCurveChart submissions={submissions} product={supplyTab} />
              </div>
            )}
            <div className="flex gap-2">
              {game?.round_status !== 'open' && game?.current_round < 5 && <button onClick={openRound} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold">Open Round {game?.current_round + 1}</button>}
              {game?.round_status === 'open' && <button onClick={closeSubmissions} className="bg-amber-600 text-white px-4 py-2 rounded font-bold">Close Round</button>}
              {game?.round_status === 'loans_reviewed' && <button onClick={clearMarket} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Clear Market</button>}
              <button onClick={resetGame} className="text-red-600 px-4 py-2">Reset</button>
            </div>
          </div>
        )}

        {tab === 'loans' && <LoanReviewPanel gameId={gameId} currentRound={game?.current_round} firms={firms} onPublish={publishLoans} />}
        {tab === 'leaderboard' && <InstructorLeaderboard leaderboard={leaderboard} loading={loadingLeaderboard} currentRound={game?.current_round} />}
        {tab === 'setup' && (
          <div className="space-y-6">
            <BalanceSheetEditor setup={editSetup || game?.setup} rates={editRates || game?.rates} onSetupChange={setEditSetup} onRatesChange={setEditRates} onSave={() => {}} disabled={game?.current_round > 1} firmCount={firms.length} />
            <DemandCurveEditor parameters={editParameters || game?.parameters} onParametersChange={setEditParameters} onSave={() => {}} currentRound={game?.current_round} roundStatus={game?.round_status} />
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}

export default TeacherDashboard;
