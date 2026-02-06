import { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Settings,
  ClipboardList,
  BarChart3,
  Table,
  TrendingUp,
  Download
} from 'lucide-react';

import { calculateYear } from './engine/simulation';
import { useMarketData } from './hooks/useMarketData';
import { getGridRows } from './constants/gridRows';

import MarketBrief from './components/MarketBrief';
import SetupPanel from './components/SetupPanel';
import PlannerGrid from './components/PlannerGrid';
import SubmissionModal from './components/SubmissionModal';
import SimpleChart from './components/charts/SimpleChart';

export default function StratFi() {

  useEffect(() => {
    document.title = "StratFi - Strategy at Altitude";
  }, []);

  const [view, setView] = useState('grid');
  const [showSetup, setShowSetup] = useState(true);

  // --- Market Data ---
  const { scenarios, isLoadingData, usingDefaults, fetchMarketData } = useMarketData();

  // --- Setup State ---
  const [setup, setSetup] = useState({
    cash: 10000,
    inventory: 0,
    fixedAssets: 20000,
    stDebt: 0,
    ltDebt: 0,
    equity: 30000,
    retainedEarnings: 10000,
    rates: { st: 10.0, lt: 5.0, tax: 30.0 },
    limits: { machine: 1000, labour: 1000, material: 500 }
  });

  // --- Decisions State ---
  const [decisions, setDecisions] = useState({
    r1: {
      general: { salesRate: 100 },
      qty: { A: 0, B: 0, C: 0 }, price: { A: 33, B: 32, C: 31 },
      inv: { machine: 0, labour: 0 },
      finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: 0 }
    },
    r2: {
      general: { salesRate: 100 },
      qty: { A: 0, B: 0, C: 0 }, price: { A: 33, B: 32, C: 31 },
      inv: { machine: 0, labour: 0 },
      finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: 0 }
    },
    r3: {
      general: { salesRate: 100 },
      qty: { A: 0, B: 0, C: 0 }, price: { A: 33, B: 32, C: 31 },
      inv: { machine: 0, labour: 0 },
      finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: 0 }
    }
  });

  const [firmId, setFirmId] = useState("");
  const [showSubmission, setShowSubmission] = useState(false);

  // State for collapsible sections
  const [collapsed, setCollapsed] = useState({
    ops: false,
    cap: false,
    growth: false,
    fin: false,
    inc: false,
    met: false,
    pos: false
  });

  const toggleSection = (sectionKey) => {
    setCollapsed(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // --- ENGINE: The Chained Calculation ---
  const simulation = useMemo(() => {
    const initialInvDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

    const y1Start = { ...setup, limits: setup.limits };
    const r1Res = calculateYear(y1Start, decisions.r1, 0, initialInvDetails, setup.rates);
    const r2Res = calculateYear(r1Res.nextStart, decisions.r2, r1Res.nextEfficiency, r1Res.inventoryDetails, setup.rates);
    const r3Res = calculateYear(r2Res.nextStart, decisions.r3, r2Res.nextEfficiency, r2Res.inventoryDetails, setup.rates);

    return { r1: r1Res, r2: r2Res, r3: r3Res };
  }, [setup, decisions]);

  const updateVal = (round, id, val) => {
    const [category, field] = id.split('.');
    setDecisions(prev => ({
      ...prev,
      [round]: {
        ...prev[round],
        [category]: {
          ...prev[round][category],
          [field]: val
        }
      }
    }));
  };

  // --- CSV Download Function ---
  const downloadCSV = () => {
    const gridRows = getGridRows();
    const rows = [];

    // Initial Position Section
    rows.push(["INITIAL POSITION"]);
    rows.push(["Category", "Item", "Value"]);
    rows.push(["Assets", "Cash", setup.cash]);
    rows.push(["Assets", "Machines", setup.fixedAssets]);
    rows.push(["Liabilities", "ST Debt", setup.stDebt]);
    rows.push(["Liabilities", "LT Debt", setup.ltDebt]);
    rows.push(["Equity", "Capital", setup.equity]);
    rows.push(["Equity", "Retained Earnings", setup.retainedEarnings]);
    rows.push(["Rates", "ST Rate %", setup.rates.st]);
    rows.push(["Rates", "Tax Rate %", setup.rates.tax]);
    rows.push(["Limits", "Machine Cap", setup.limits.machine]);
    rows.push(["Limits", "Labour Cap", setup.limits.labour]);
    rows.push([]);

    // Strategic Planner Section
    rows.push(["STRATEGIC PLANNER"]);
    rows.push(["Metric", "Round 1 (Decision)", "Round 2 (Proj)", "Round 3 (Proj)"]);

    gridRows.forEach(row => {
      if (row.type === 'header') {
        rows.push([row.label.toUpperCase()]);
      } else if (row.type === 'spacer') {
        rows.push([]);
      } else {
        const rowData = [row.label];
        ['r1', 'r2', 'r3'].forEach(round => {
          let val = '';
          if (row.type === 'input') {
            const [cat, field] = row.id.split('.');
            val = decisions[round][cat][field];
          } else if (row.type === 'displayLimit') {
            val = simulation[round].limits[row.id];
          } else if (row.type === 'status') {
            const status = simulation[round].capacityCheck[row.id];
            val = status.limit > 0 ? (status.used / status.limit) : 0;
            val = (val * 100).toFixed(0) + '%';
          } else if (row.type === 'output') {
            val = simulation[round].financials[row.id];
          }
          rowData.push(val);
        });
        rows.push(rowData);
      }
    });

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `StratFi_Projections_${firmId || 'Draft'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            StratFi <span className="text-sm font-normal text-slate-400">| Strategy at Altitude</span>
          </h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
            <button
                onClick={() => setView('market')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'market' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <TrendingUp className="w-4 h-4" /> Brief
            </button>
            <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Table className="w-4 h-4" /> Planner
            </button>
            <button
                onClick={() => setView('charts')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${view === 'charts' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <BarChart3 className="w-4 h-4" /> Analysis
            </button>
            <button
                onClick={downloadCSV}
                className="px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                title="Download Excel/CSV"
            >
                <Download className="w-4 h-4" />
            </button>
            <button
                onClick={() => setShowSetup(!showSetup)}
                className={`p-2 rounded-md transition-all ${showSetup ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}
                title="Initial Position Settings"
            >
                <Settings className="w-4 h-4" />
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">

        {/* VIEW: MARKET BRIEF */}
        {view === 'market' && (
          <MarketBrief scenarios={scenarios} onRefresh={fetchMarketData} loading={isLoadingData} usingDefaults={usingDefaults} />
        )}

        {/* VIEW: GRID (PLANNER) */}
        {view === 'grid' && (
          <>
            {/* 1. INITIAL SETUP */}
            <SetupPanel setup={setup} setSetup={setSetup} showSetup={showSetup} setShowSetup={setShowSetup} />

            {/* 2. THE MASTER GRID */}
            <PlannerGrid
              decisions={decisions}
              simulation={simulation}
              updateVal={updateVal}
              collapsed={collapsed}
              toggleSection={toggleSection}
            />

            {/* SUBMISSION BUTTON */}
            <div className="flex justify-center pt-8 pb-12">
              <button
                onClick={() => setShowSubmission(!showSubmission)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3 transition-all"
              >
                <ClipboardList className="w-5 h-5" />
                {showSubmission ? "Hide Ticket" : "Generate Round 1 Submission Ticket"}
              </button>
            </div>
          </>
        )}

        {/* VIEW: CHARTS */}
        {view === 'charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SimpleChart
              title="Revenue Trend"
              dataKey="revenue"
              color="#4f46e5"
              data={[
                { label: 'R1', revenue: simulation.r1.financials.revenue },
                { label: 'R2', revenue: simulation.r2.financials.revenue },
                { label: 'R3', revenue: simulation.r3.financials.revenue },
              ]}
            />
            <SimpleChart
              title="Net Income Trend"
              dataKey="netIncome"
              color="#10b981"
              data={[
                { label: 'R1', netIncome: simulation.r1.financials.netIncome },
                { label: 'R2', netIncome: simulation.r2.financials.netIncome },
                { label: 'R3', netIncome: simulation.r3.financials.netIncome },
              ]}
            />
            <SimpleChart
              title="Cash Position"
              dataKey="cash"
              color="#f59e0b"
              data={[
                { label: 'R1', cash: simulation.r1.financials.cash },
                { label: 'R2', cash: simulation.r2.financials.cash },
                { label: 'R3', cash: simulation.r3.financials.cash },
              ]}
            />
            <SimpleChart
              title="Return on Equity (ROE)"
              dataKey="roe"
              color="#ec4899"
              format="percent"
              data={[
                { label: 'R1', roe: simulation.r1.financials.roe },
                { label: 'R2', roe: simulation.r2.financials.roe },
                { label: 'R3', roe: simulation.r3.financials.roe },
              ]}
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
        />

      </main>
    </div>
  );
}
