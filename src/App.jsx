import { useState, useMemo, useEffect } from 'react';
import {
  Settings,
  ClipboardList,
  BarChart3,
  Table,
  TrendingUp,
  Trophy,
  Download,
  LogOut,
  HelpCircle
} from 'lucide-react';

import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { calculateYear } from './engine/simulation';
import { useMarketData } from './hooks/useMarketData';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useLoanRequests } from './hooks/useLoanRequests';
import { calculateCreditRating } from './utils/creditRating';

import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import MarketBrief from './components/MarketBrief';
import SetupPanel from './components/SetupPanel';
import PlannerTabs from './components/planner/PlannerTabs';
import SubmissionModal from './components/SubmissionModal';
import SimpleChart from './components/charts/SimpleChart';
import Leaderboard from './components/Leaderboard';
import Footer from './components/ui/Footer';
import TutorialPage from './components/TutorialPage';

// --- Root App: Auth Gate ---
export default function App() {
  const { 
    session, 
    loading, 
    error, 
    loginStudent, 
    loginInstructor, 
    signUpInstructor, 
    logout 
  } = useAuth();
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    document.title = "MutandisLab - Change What Must";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Not logged in and not in demo mode → show login
  if (!session && !demoMode) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <div className="flex-grow flex items-center justify-center py-12 px-4">
          <LoginPage
            onLoginStudent={loginStudent}
            onLoginInstructor={loginInstructor}
            onSignUpInstructor={signUpInstructor}
            onDemo={() => setDemoMode(true)}
            error={error}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Teacher → dashboard
  if (session?.role === 'teacher') {
    return <TeacherDashboard session={session} logout={logout} />;
  }

  // Student or demo mode → planner
  return <StratFi session={session} logout={logout} onExitDemo={!session ? () => setDemoMode(false) : null} />;
}

// --- Planner App (Student / Demo) ---
function StratFi({ session, logout, onExitDemo }) {

  const [view, setView] = useState('grid');
  const [showSetup, setShowSetup] = useState(!session); // hide setup in game mode
  const [showTutorial, setShowTutorial] = useState(false);

  // --- Market Data ---
  const { scenarios, isLoadingData, usingDefaults, fetchMarketData } = useMarketData(session?.gameId);

  // --- Leaderboard ---
  const { leaderboard, loading: isLoadingLeaderboard } = useLeaderboard(session?.gameId);

  // --- Game Data State ---
  const [gameData, setGameData] = useState(null);
  const [history, setHistory] = useState([]); // Array of cleared firm_states
  const [lastState, setLastState] = useState(null); // The starting point for current round

  // --- Loan Requests (NEW) ---
  const { loanRequests } = useLoanRequests(session, gameData);

  // --- Decisions State (Current Round Only) ---
  const [decisions, setDecisions] = useState({
    qty: { A: 0, B: 0, C: 0 }, sales: { A: 0, B: 0, C: 0 }, price: { A: 33, B: 32, C: 31 },
    inv: { machine: 0, labour: 0 },
    finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: 0 }
  });

  // --- Setup State (for Demo Mode) ---
  const [demoSetup, setDemoSetup] = useState({
    cash: 29200, 
    inventory: 0,
    fixedAssets: 20000,
    stDebt: 0,
    ltDebt: 0,
    equity: 30000,
    retainedEarnings: 19200, 
    rates: { st: 10.0, lt: 5.0, tax: 30.0 },
    limits: { machine: 1000, labour: 1000, material: 500 }
  });

  const [firmId, setFirmId] = useState(session?.firmName || "");
  const [showSubmission, setShowSubmission] = useState(false);

  // Load game data
  useEffect(() => {
    if (!session) {
        // DEMO MODE: Initialize lastState from demoSetup
        setLastState({
            state: demoSetup,
            inventory_details: { A:{units:0,value:0}, B:{units:0,value:0}, C:{units:0,value:0} },
            efficiency: 0
        });
        return;
    }

    if (!supabase) return;

    let cancelled = false;

    // 1. Fetch Initial Data
    async function loadData() {
      // 1. Fetch Game Config
      const { data: game } = await supabase
        .from('games')
        .select('setup, rates, current_round, round_status')
        .eq('id', session.gameId)
        .single();

      if (cancelled) return;

      if (game) {
        setGameData(game);

        // If round opens, reset decisions
        // (This logic might be tricky if we re-fetch same data, so we might want to check against previous state, but inside async it's hard. 
        //  However, setGameData will trigger re-renders. The decision reset logic was checking existing state.)
        //  Simplified: We only load decisions once on mount. The reset logic should probably be in a separate effect or handled more carefully.
        //  For now, I'll keep the loading logic here.

        // 2. Load History (Firm States)
        const { data: states } = await supabase
          .from('firm_state')
          .select('round, state, inventory_details, efficiency')
          .eq('game_id', session.gameId)
          .eq('firm_id', session.firmId)
          .order('round', { ascending: true });

        if (cancelled) return;

        // 3. Determine Last State
        if (states && states.length > 0) {
            setHistory(states);
            const prevRoundNum = game.current_round - 1;
            const prevRec = states.find(s => s.round === prevRoundNum);
            
            if (prevRec) {
                setLastState({
                    ...prevRec,
                    state: { ...prevRec.state, rates: game.rates } 
                });
            } else {
                const latest = states[states.length - 1];
                setLastState({
                    ...latest,
                    state: { ...latest.state, rates: game.rates }
                });
            }
        } else {
            const initialState = {
                state: { ...game.setup, rates: game.rates },
                inventory_details: { A:{units:0,value:0}, B:{units:0,value:0}, C:{units:0,value:0} },
                efficiency: 0
            };
            setLastState(initialState);
            setHistory([{ round: 0, ...initialState }]); 
        }

        // 4. Load Existing Decisions
        const { data: existingDec } = await supabase
          .from('decisions')
          .select('data')
          .eq('game_id', session.gameId)
          .eq('firm_id', session.firmId)
          .eq('round', game.current_round)
          .single();

        if (cancelled) return;

        if (existingDec?.data) {
          setDecisions(existingDec.data);
        } else {
          setDecisions({
             qty: { A: 0, B: 0, C: 0 }, sales: { A: 0, B: 0, C: 0 }, price: { A: 33, B: 32, C: 31 },
             inv: { machine: 0, labour: 0 },
             finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: 0 }
          });
        }
      }
    }

    loadData();

    // 2. Subscribe to Game Updates
    const channel = supabase.channel('game_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${session.gameId}` },
        (payload) => {
          setGameData(prev => prev ? { ...prev, ...payload.new } : payload.new);
        }
      )
      .subscribe();

    return () => {
        cancelled = true;
        supabase.removeChannel(channel);
    };
  }, [session, demoSetup]); // Add demoSetup dependency so demo mode updates work

  // --- ENGINE: Current Round Projection ---
  const simulation = useMemo(() => {
    if (!lastState) return null;

    // If the round is cleared, we use the actual results stored in history
    if (gameData?.round_status === 'cleared') {
        const actualRec = history.find(h => h.round === gameData.current_round);
        if (actualRec) {
            // Return an object that matches the structure returned by calculateYear
            return {
                financials: actualRec.state.financials || actualRec.state,
                inventoryDetails: actualRec.inventory_details,
                limits: actualRec.state.limits || lastState.state.limits || { machine: 1000, labour: 1000, material: 500 },
                usage: actualRec.state.usage || { machine: 0, labour: 0 },
                nextStart: actualRec.state, // This is basically what we saved as nextStart
                nextEfficiency: actualRec.efficiency,
                capacityCheck: actualRec.state.capacityCheck || {
                    machine: { used: 0, limit: 1000, isOver: false },
                    labour: { used: 0, limit: 1000, isOver: false }
                }
            };
        }
    }

    // Ensure limits exist in start state (backward compatibility)
    const startState = { 
        ...lastState.state, 
        limits: lastState.state.limits || { machine: 1000, labour: 1000, material: 500 }
    };

    // Calculate dynamic rates based on credit rating (including proposed debt)
    const baseRates = startState.rates || { st: 10, lt: 5 };
    const baseFinancials = lastState?.financials || startState;
    const projectedForCredit = {
      ...baseFinancials,
      stDebt: (baseFinancials.stDebt || 0) + Number(decisions.finance.newST || 0),
      ltDebt: (baseFinancials.ltDebt || 0) + Number(decisions.finance.newLT || 0),
    };
    const creditProfile = calculateCreditRating(projectedForCredit, baseRates);
    const dynamicLoanTerms = {
      st: { rate: creditProfile.estimatedST },
      lt: { rate: creditProfile.estimatedLT }
    };

    return calculateYear(
        startState, 
        decisions, 
        lastState.efficiency || 0, 
        lastState.inventory_details, 
        startState.rates,
        dynamicLoanTerms
    );
  }, [lastState, decisions, gameData, history]);

  const updateVal = (id, val) => {
    const [category, field] = id.split('.');
    setDecisions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: val
      }
    }));
  };

  // --- Chart Data Preparation ---
  const chartData = useMemo(() => {
    if (!simulation) return [];
    
    // Convert History to chart format
    const data = history.map(h => {
        // Handle cases where financials might be nested or top-level (legacy)
        const fin = h.state.financials || h.state; 
        return {
            label: h.round === 0 ? 'Start' : `R${h.round}`,
            revenue: fin.revenue || 0,
            netIncome: fin.netIncome || 0,
            cash: fin.cash || 0,
            roe: fin.roe || 0
        };
    });

    // Add Current Projection (only if not already cleared)
    if (gameData?.round_status !== 'cleared') {
        const currentRoundLabel = gameData ? `R${gameData.current_round} (Proj)` : 'Proj';
        data.push({
            label: currentRoundLabel,
            revenue: simulation.financials.revenue,
            netIncome: simulation.financials.netIncome,
            cash: simulation.financials.cash,
            roe: simulation.financials.roe
        });
    }

    return data;
  }, [history, simulation, gameData]);


  // --- CSV Download Function ---
  const downloadCSV = () => {
    // Basic implementation for now - exports current view
    // Ideally update to export full history + projection
    alert("Export feature will be updated to support the new data format soon.");
  };

  const isGameMode = !!session;
  const roundLabel = gameData ? `Round ${gameData.current_round}` : 'Demo';
  const roundOpen = !gameData || gameData.round_status === 'open';

  if (!simulation) return <div className="p-10 text-center text-slate-400">Loading Simulation...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4">
      {/* GLOBAL STYLES FOR REMOVING INPUT SPINNERS */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-[#1a365d] p-4 rounded-xl shadow-lg border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <img src="/logo_transparent.png" alt="MutandisLab Logo" className="h-8 w-auto" />
            MutandisLab <span className="text-sm font-normal text-[#4fd1c5]">| Change What Must</span>
          </h1>
          {isGameMode && (
            <div className="text-xs text-slate-300 mt-1">
              {session.firmName} &middot; {session.gameName} &middot; {roundLabel}
              {!roundOpen && <span className="ml-2 text-amber-400 font-bold">Submissions Closed</span>}
            </div>
          )}
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-lg gap-1">
            <button
                onClick={() => setView('market')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'market' ? 'bg-[#4fd1c5] shadow text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
                <TrendingUp className="w-4 h-4" /> Brief
            </button>
            <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'grid' ? 'bg-[#4fd1c5] shadow text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
                <Table className="w-4 h-4" /> Planner
            </button>
            {isGameMode && (
              <button
                  onClick={() => setView('leaderboard')}
                  className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'leaderboard' ? 'bg-[#4fd1c5] shadow text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
              >
                  <Trophy className="w-4 h-4" /> Leaderboard
              </button>
            )}
            <button
                onClick={() => setView('charts')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'charts' ? 'bg-[#4fd1c5] shadow text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
                <BarChart3 className="w-4 h-4" /> Analysis
            </button>

            {/* Help/Tutorial Button */}
            <button
                onClick={() => setShowTutorial(true)}
                className="px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all text-slate-300 hover:text-[#4fd1c5] hover:bg-slate-700"
                title="Help & Tutorial"
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
            </button>

            {/* Download Button temporarily disabled or simplified */}

            {/* Help/Tutorial Button */}
            <button
                onClick={downloadCSV}
                className="px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all text-slate-300 hover:text-white hover:bg-slate-700"
                title="Download CSV"
            >
                <Download className="w-4 h-4" />
            </button>
            {!isGameMode && (
              <button
                  onClick={() => setShowSetup(!showSetup)}
                  className={`p-2 rounded-md transition-all ${showSetup ? 'bg-slate-700 text-[#4fd1c5]' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  title="Initial Position Settings"
              >
                  <Settings className="w-4 h-4" />
              </button>
            )}
            {(logout || onExitDemo) && (
              <button
                  onClick={logout || onExitDemo}
                  className="p-2 rounded-md transition-all text-slate-400 hover:text-red-400 hover:bg-red-900/30"
                  title={isGameMode ? "Sign Out" : "Back to Login"}
              >
                  <LogOut className="w-4 h-4" />
              </button>
            )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">

        {/* VIEW: MARKET BRIEF */}
        {view === 'market' && (
          <MarketBrief scenarios={scenarios} onRefresh={fetchMarketData} loading={isLoadingData} usingDefaults={usingDefaults} />
        )}

        {/* VIEW: PLANNER (TABS) */}
        {view === 'grid' && (
          <>
            {/* 1. INITIAL SETUP (demo mode only) */}
            {!isGameMode && (
              <SetupPanel setup={demoSetup} setSetup={setDemoSetup} showSetup={showSetup} setShowSetup={setShowSetup} />
            )}

            {/* 2. THE PLANNER TABS */}
            <PlannerTabs
              decisions={decisions}
              simulation={simulation}
              lastState={lastState?.state}
              updateVal={updateVal}
              gameData={gameData}
              history={history}
              isGameMode={isGameMode}
              loanRequests={loanRequests}
            />

            {/* SUBMISSION BUTTON */}
            <div className="flex justify-center pt-8 pb-12">
              <button
                onClick={() => setShowSubmission(!showSubmission)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3 transition-all"
              >
                <ClipboardList className="w-5 h-5" />
                {isGameMode
                  ? (showSubmission ? "Hide Submission" : `Submit ${roundLabel} Decisions`)
                  : (showSubmission ? "Hide Ticket" : "Generate Submission Ticket")}
              </button>
            </div>
          </>
        )}

        {/* VIEW: LEADERBOARD */}
        {view === 'leaderboard' && (
          <Leaderboard 
            leaderboard={leaderboard} 
            loading={isLoadingLeaderboard} 
            currentRound={gameData?.current_round} 
          />
        )}

        {/* VIEW: CHARTS */}
        {view === 'charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SimpleChart
              title="Revenue Trend"
              dataKey="revenue"
              color="#4f46e5"
              data={chartData}
            />
            <SimpleChart
              title="Net Income Trend"
              dataKey="netIncome"
              color="#10b981"
              data={chartData}
            />
            <SimpleChart
              title="Cash Position"
              dataKey="cash"
              color="#f59e0b"
              data={chartData}
            />
            <SimpleChart
              title="Return on Equity (ROE)"
              dataKey="roe"
              color="#ec4899"
              format="percent"
              data={chartData}
            />
          </div>
        )}

        {/* SUBMISSION MODAL */}
        <SubmissionModal
          firmId={firmId}
          setFirmId={setFirmId}
          decisions={decisions}
          simulation={simulation}
          showSubmission={showSubmission}
          setShowSubmission={setShowSubmission}
          session={session}
          gameData={gameData}
        />

        {/* TUTORIAL MODAL */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl">
              <TutorialPage onClose={() => setShowTutorial(false)} />
            </div>
          </div>
        )}

        <Footer />

      </main>
    </div>
  );
}