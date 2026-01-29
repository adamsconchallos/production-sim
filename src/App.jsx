import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Settings, 
  ClipboardList,
  X,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Table,
  AlertTriangle,
  Lightbulb,
  Download,
  Copy,
  ExternalLink,
  TrendingUp,
  RefreshCw 
} from 'lucide-react';


// --- CONFIGURATION ---
// We use the "Published to Web" ID (2PACX...) not the editing ID.
// IMPORTANT: Changed '/pubhtml' to '/pub?output=csv' to get raw data instead of HTML.
const PUBLISHED_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSJM77z8w5otsNJ7G287thlhqCgdlLaexKnV6gzsiIrrok0dXp-NjFdp14eu4906arzwzxdbuObRhJF/pub?gid=0&single=true&output=csv`;
// FIX: Use a CORS Proxy to bypass browser restrictions
const PROXY = "https://api.allorigins.win/raw?url=";
const SHEET_CSV_URL = `${PROXY}${encodeURIComponent(PUBLISHED_URL)}`;

// --- CONSTANTS: Default Data (Fallback) ---
const DEFAULT_SCENARIOS = {
  A: {
    name: "Product A (Mass Market)",
    history: [
      { year: "Y-4", price: 26, demand: 11000 },
      { year: "Y-3", price: 27, demand: 11500 },
      { year: "Y-2", price: 28, demand: 12000 },
      { year: "Y-1", price: 30, demand: 12500 },
      { year: "Y0",  price: 32, demand: 13000 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 33.50, sd: 1.5 },
      demand: { mean: 13500, sd: 800 }
    }
  },
  B: {
    name: "Product B (Specialized)",
    history: [
      { year: "Y-4", price: 42, demand: 7000 },
      { year: "Y-3", price: 40, demand: 7500 },
      { year: "Y-2", price: 38, demand: 8000 },
      { year: "Y-1", price: 36, demand: 8500 },
      { year: "Y0",  price: 35, demand: 9000 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 34.00, sd: 2.0 },
      demand: { mean: 9500, sd: 1200 }
    }
  },
  C: {
    name: "Product C (Premium/Niche)",
    history: [
      { year: "Y-4", price: 38, demand: 2500 },
      { year: "Y-3", price: 39, demand: 2800 },
      { year: "Y-2", price: 40, demand: 3000 },
      { year: "Y-1", price: 42, demand: 3200 },
      { year: "Y0",  price: 45, demand: 3500 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 46.50, sd: 3.0 },
      demand: { mean: 3800, sd: 400 }
    }
  }
};

// --- UI Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Tooltip = ({ text, width = "w-64" }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <HelpCircle className="w-3 h-3 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
    <div className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute left-full top-1/2 -translate-y-1/2 ml-2 ${width} bg-slate-800 text-white text-[11px] leading-tight rounded p-2 z-50 shadow-xl pointer-events-none`}>
      {text}
      <div className="absolute left-0 top-1/2 -translate-x-[4px] -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-800"></div>
    </div>
  </div>
);

const InputCell = ({ value, onChange, prefix = "", suffix = "", className = "", warning = null, readOnly = false }) => (
  <div className={`relative flex items-center h-full w-full ${className}`}>
    {prefix && (
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <span className="text-slate-400 text-[10px]">{prefix}</span>
      </div>
    )}
    <input
      type="number"
      className={`block w-full h-full bg-transparent ${prefix ? 'pl-5' : 'pl-2'} ${suffix ? 'pr-6' : 'pr-1'} border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm text-right appearance-none ${warning ? 'text-amber-600 font-bold' : ''} ${readOnly ? 'text-slate-500 bg-slate-50 cursor-default' : ''}`}
      value={value}
      onChange={(e) => !readOnly && onChange(parseFloat(e.target.value) || 0)}
      readOnly={readOnly}
    />
    {suffix && (
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
        <span className="text-slate-400 text-[10px]">{suffix}</span>
      </div>
    )}
    {warning && (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
      </div>
    )}
  </div>
);

// --- SIMPLE CHART COMPONENT (For Analysis Tab) ---
const SimpleChart = ({ title, data, dataKey, color = "#4f46e5", format = "currency" }) => {
  const height = 150;
  const width = 300;
  const padding = 20;
  
  const values = data.map(d => d[dataKey]);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = (max - min) || 1; 

  const getY = (val) => {
    return height - padding - ((val - min) / range) * (height - (padding * 2));
  };

  const formatY = (val) => {
      if (format === 'percent') return val.toFixed(1) + '%';
      if (Math.abs(val) >= 1000) return (val/1000).toFixed(1) + 'k';
      return val.toFixed(0);
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">{title}</h4>
      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          <line x1={padding} y1={getY(0)} x2={width-padding} y2={getY(0)} stroke="#e2e8f0" strokeWidth="1" />
          <polyline
            points={data.map((d, i) => {
              const x = padding + (i * ((width - (padding*2)) / (data.length - 1)));
              return `${x},${getY(d[dataKey])}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          {data.map((d, i) => {
            const x = padding + (i * ((width - (padding*2)) / (data.length - 1)));
            const y = getY(d[dataKey]);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                  {format === 'currency' && '$'}{formatY(d[dataKey])}
                </text>
                <text x={x} y={height + 15} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// --- FAN CHART COMPONENT (For Market Brief Tab) ---
const FanChart = ({ title, data, type = 'price', color = "#4f46e5" }) => {
  const height = 220;
  const width = 400;
  const padding = 40;

  // Extract Data
  const history = data.history || [];
  const forecast = data.forecast || { year: '?', price: {mean:0, sd:0}, demand: {mean:0, sd:0} };
  const fData = forecast[type] || { mean: 0, sd: 0 };
  
  // Combine for scaling
  const allValues = [
    ...history.map(d => d[type]),
    fData.mean + (fData.sd * 2),
    fData.mean - (fData.sd * 2)
  ];
  
  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = (maxVal - minVal) || 1;

  const getX = (index, totalPoints) => padding + (index * ((width - (padding*2)) / (totalPoints - 1)));
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - (padding * 2));

  const totalPoints = history.length + 1;
  const lastHistIndex = history.length - 1;
  
  if (history.length === 0) return <div>No Data</div>;

  // 1. History Line Path
  let histPath = "";
  history.forEach((d, i) => {
    histPath += `${i === 0 ? 'M' : 'L'} ${getX(i, totalPoints)} ${getY(d[type])} `;
  });

  // 2. Forecast Cone
  const startX = getX(lastHistIndex, totalPoints);
  const startY = getY(history[lastHistIndex][type]);
  const endX = getX(lastHistIndex + 1, totalPoints);
  
  const meanY = getY(fData.mean);
  const sd1UpY = getY(fData.mean + fData.sd);
  const sd1DownY = getY(fData.mean - fData.sd);
  const sd2UpY = getY(fData.mean + (fData.sd * 2));
  const sd2DownY = getY(fData.mean - (fData.sd * 2));

  const formatVal = (v) => type === 'price' ? `$${v.toFixed(2)}` : v.toLocaleString();

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between">
        <span>{title}</span>
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Forecast {forecast.year}</span>
      </h4>
      <div className="flex-grow flex justify-center items-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />
          
          <path d={`M ${startX} ${startY} L ${endX} ${sd2UpY} L ${endX} ${sd2DownY} Z`} fill={color} opacity="0.15" />
          <path d={`M ${startX} ${startY} L ${endX} ${sd1UpY} L ${endX} ${sd1DownY} Z`} fill={color} opacity="0.3" />
          <path d={histPath} fill="none" stroke={color} strokeWidth="2.5" />
          <line x1={startX} y1={startY} x2={endX} y2={meanY} stroke={color} strokeWidth="2" strokeDasharray="4,4" />

          {history.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i, totalPoints)} cy={getY(d[type])} r="3" fill="white" stroke={color} strokeWidth="2" />
              <text x={getX(i, totalPoints)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.year}</text>
            </g>
          ))}
          
          <text x={endX} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">{forecast.year}</text>
          <text x={padding - 5} y={getY(maxVal)} textAnchor="end" fontSize="10" fill="#94a3b8">{formatVal(maxVal)}</text>
          <text x={padding - 5} y={getY(minVal)} textAnchor="end" fontSize="10" fill="#94a3b8">{formatVal(minVal)}</text>

          <text x={endX + 5} y={sd2UpY} fontSize="9" fill={color} alignmentBaseline="middle">High (2SD)</text>
          <text x={endX + 5} y={meanY} fontSize="9" fontWeight="bold" fill={color} alignmentBaseline="middle">Mean</text>
          <text x={endX + 5} y={sd2DownY} fontSize="9" fill={color} alignmentBaseline="middle">Low (2SD)</text>
        </svg>
      </div>
    </div>
  );
};

// --- MARKET BRIEF VIEW COMPONENT ---
const MarketBrief = ({ scenarios, onRefresh, loading, usingDefaults }) => {
  const [activeTab, setActiveTab] = useState("A");
  const data = scenarios[activeTab];

  return (
    <div className="space-y-6">
      {/* Product Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-1">
        <div className="flex space-x-2">
            {Object.keys(scenarios).map(key => (
            <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${activeTab === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
                {scenarios[key].name}
            </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
            {usingDefaults && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Using Default Data
                </span>
            )}
            <button 
                onClick={onRefresh} 
                className={`flex items-center gap-1 text-xs transition-colors mr-2 px-3 py-1 rounded border ${loading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-wait' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                title="Fetch latest market data"
                disabled={loading}
            >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> 
                {loading ? "Loading..." : "Refresh Data"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FanChart title="Price Forecast ($)" data={data} type="price" color="#0ea5e9" />
        <FanChart title="Total Market Demand (Units)" data={data} type="demand" color="#8b5cf6" />
      </div>

      <Card className="p-0">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Forecast Summary Table</h3>
          <span className="text-xs text-slate-400 italic">Confidence Level: 95% (2SD)</span>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">Metric</th>
              <th className="p-4">Current ({data.history[data.history.length-1].year})</th>
              <th className="p-4 bg-indigo-50 text-indigo-700">Forecast Mean ({data.forecast.year})</th>
              <th className="p-4">Low Case (-2SD)</th>
              <th className="p-4">High Case (+2SD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4 font-bold text-slate-700">Market Price</td>
              <td className="p-4">${data.history[data.history.length-1].price.toFixed(2)}</td>
              <td className="p-4 bg-indigo-50 font-bold text-indigo-700">${data.forecast.price.mean.toFixed(2)}</td>
              <td className="p-4 text-red-600">${(data.forecast.price.mean - (2 * data.forecast.price.sd)).toFixed(2)}</td>
              <td className="p-4 text-emerald-600">${(data.forecast.price.mean + (2 * data.forecast.price.sd)).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-700">Total Demand</td>
              <td className="p-4">{data.history[data.history.length-1].demand.toLocaleString()}</td>
              <td className="p-4 bg-indigo-50 font-bold text-indigo-700">{data.forecast.demand.mean.toLocaleString()}</td>
              <td className="p-4 text-slate-500">{(data.forecast.demand.mean - (2 * data.forecast.demand.sd)).toLocaleString()}</td>
              <td className="p-4 text-slate-500">{(data.forecast.demand.mean + (2 * data.forecast.demand.sd)).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 bg-amber-50 text-amber-800 text-xs border-t border-amber-100">
          <strong>Strategic Hint:</strong> The "Forecast Mean" assumes the industry supply grows at a historical average rate. 
          If you believe competitors will oversupply (aggressive expansion), expect prices to trend toward the <strong>Low Case</strong>. 
          If supply is constrained, prices may hit the <strong>High Case</strong>.
        </div>
      </Card>
    </div>
  );
};

// --- Constants & Helper Functions ---

const DEPRECIATION_RATE = 0.05; 
const CAPACITY_PER_1000_MACHINE = 50; 
const CAPACITY_PER_1000_LABOUR = 100; 
const EFFICIENCY_GAIN_PER_10K_INV = 0.01; 

const RECIPE = {
  machine: { A: 2.0, B: 1.5, C: 1.0 },
  labour: { A: 1.0, B: 1.5, C: 2.0 },
  material: { A: 1.0, B: 1.0, C: 1.0 }
};

const BASE_COSTS = {
  machine: 10,
  labour: 8,
  material: 5
};

export default function StratFi() {
  
  useEffect(() => {
    document.title = "StratFi - Strategy at Altitude";
  }, []);

  const [view, setView] = useState('grid'); 
  const [showSetup, setShowSetup] = useState(true);
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);

  // --- DATA FETCHING ---
  const fetchMarketData = async () => {
      setIsLoadingData(true);
      setUsingDefaults(false);
      try {
          const response = await fetch(SHEET_CSV_URL);
          if (!response.ok) throw new Error("Network response was not ok");
          const text = await response.text();
          
          // Basic CSV Parse (Robust for AllOrigins response)
          // Rows might contain \r\n
          const rows = text.split(/\r?\n/).slice(1); // skip header
          
          if (rows.length < 3) {
              throw new Error("Empty data received");
          }

          const newScenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS)); 
          ['A','B','C'].forEach(p => {
              newScenarios[p].history = [];
              newScenarios[p].forecast = null; // Clear to detect later
          });

          let validRowsCount = 0;

          rows.forEach(row => {
              // CSV split handling simple commas
              const cols = row.split(',').map(c => c ? c.replace(/^"|"$/g, '').trim() : '');
              if (cols.length < 5) return;
              
              const [prod, type, year, price, demand, priceSD, demandSD] = cols;
              if (!newScenarios[prod]) return;

              validRowsCount++;

              const pSD = parseFloat(priceSD || "0");
              const dSD = parseFloat(demandSD || "0");

              // LOGIC UPDATE: Use SD presence OR "Forecast" label to identify the single forecast row
              const isForecast = (pSD > 0 || dSD > 0) || (type && type.toLowerCase() === 'forecast');

              if (isForecast) {
                  newScenarios[prod].forecast = {
                      year,
                      price: { mean: parseFloat(price), sd: pSD },
                      demand: { mean: parseFloat(demand), sd: dSD }
                  };
              } else {
                  newScenarios[prod].history.push({
                      year, 
                      price: parseFloat(price), 
                      demand: parseFloat(demand)
                  });
              }
          });
          
          // SORTING UPDATE: Auto-sort history chronologically
          ['A','B','C'].forEach(p => {
              if (!newScenarios[p].history.length) return;
              
              newScenarios[p].history.sort((a, b) => {
                  // Try to extract numbers from "Y-4", "Year 1", "2023"
                  const numA = parseFloat(a.year.replace(/[^0-9.-]+/g, ""));
                  const numB = parseFloat(b.year.replace(/[^0-9.-]+/g, ""));
                  
                  // If both have valid numbers, sort numerically
                  if (!isNaN(numA) && !isNaN(numB)) {
                      return numA - numB; 
                  }
                  // Fallback: String sort
                  return a.year.localeCompare(b.year, undefined, { numeric: true });
              });

              // Safety check: if no forecast found, use last history + dummy SD
              if (!newScenarios[p].forecast) {
                  const lastHist = newScenarios[p].history[newScenarios[p].history.length - 1];
                  newScenarios[p].forecast = {
                      year: "Next",
                      price: { mean: lastHist.price, sd: 0 },
                      demand: { mean: lastHist.demand, sd: 0 }
                  };
              }
          });
          
          if (validRowsCount > 0) {
            setScenarios(newScenarios);
          } else {
            throw new Error("No valid rows parsed");
          }

      } catch (e) {
          console.warn("Failed to load market data, using defaults:", e);
          setUsingDefaults(true);
          setScenarios(DEFAULT_SCENARIOS);
      } finally {
          setIsLoadingData(false);
      }
  };

  // Fetch on mount
  useEffect(() => {
      fetchMarketData();
  }, []);

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
    const calculateYear = (start, decision, prevEfficiency = 0, startInventoryDetails) => {
      // 1. Efficiency & Costs
      const costMultiplier = 1 - prevEfficiency;
      const salesRate = decision.general.salesRate / 100;

      let revenue = 0;
      let totalProdCost = 0; 
      let cogs = 0;          
      let machineHoursUsed = 0;
      let labourHoursUsed = 0;
      let totalUnitsSold = 0;
      let totalInventoryUnits = 0;
      let totalInventoryValue = 0;
      
      const nextInventoryDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

      const products = ['A', 'B', 'C'];
      
      let salesCapped = false;
      let maxRatePossible = 0;

      products.forEach(p => {
        const prodQty = decision.qty[p];
        
        machineHoursUsed += prodQty * RECIPE.machine[p];
        labourHoursUsed += prodQty * RECIPE.labour[p];
        
        const unitMachineCost = RECIPE.machine[p] * BASE_COSTS.machine;
        const unitLabourCost = RECIPE.labour[p] * BASE_COSTS.labour;
        const unitMatCost = RECIPE.material[p] * BASE_COSTS.material;
        const currentUnitCost = (unitMachineCost + unitLabourCost + unitMatCost) * costMultiplier;

        totalProdCost += prodQty * currentUnitCost; 

        // --- FIFO SALES LOGIC ---
        const oldUnits = startInventoryDetails ? startInventoryDetails[p].units : 0;
        const oldTotalValue = startInventoryDetails ? startInventoryDetails[p].value : 0;
        const oldUnitCost = oldUnits > 0 ? oldTotalValue / oldUnits : 0;
        const available = oldUnits + prodQty;

        // interpret salesRate as sell-through of available stock (cap at 100%)
        const sellThrough = Math.min(salesRate, 1);
        let demand = available * sellThrough;

        // optional UI flag: if user typed >100%, show it is capped to 100%
        if (salesRate > 1 && available > 0) {
          salesCapped = true;
          maxRatePossible = 100;
        }

        let soldFromOld = 0;
        let soldFromNew = 0;

        if (demand <= oldUnits) {
            soldFromOld = demand;
            soldFromNew = 0;
        } else {
            soldFromOld = oldUnits;
            soldFromNew = demand - oldUnits;
        }

        totalUnitsSold += (soldFromOld + soldFromNew);

        revenue += (soldFromOld + soldFromNew) * decision.price[p];
        
        const cogsOld = soldFromOld * oldUnitCost;
        const cogsNew = soldFromNew * currentUnitCost;
        cogs += (cogsOld + cogsNew);

        const endUnitsOld = oldUnits - soldFromOld;
        const endUnitsNew = prodQty - soldFromNew;
        const endValueOld = endUnitsOld * oldUnitCost; 
        const endValueNew = endUnitsNew * currentUnitCost; 

        nextInventoryDetails[p].units = endUnitsOld + endUnitsNew;
        nextInventoryDetails[p].value = endValueOld + endValueNew;

        totalInventoryUnits += nextInventoryDetails[p].units;
        totalInventoryValue += nextInventoryDetails[p].value;
      });

      // 2. Fixed Costs
      const endST = Math.max(0, start.stDebt - decision.finance.payST + decision.finance.newST);
      const endLT = Math.max(0, start.ltDebt - decision.finance.payLT + decision.finance.newLT);
      const interest = (endST * (setup.rates.st/100)) + (endLT * (setup.rates.lt/100));
      const depreciation = start.fixedAssets * DEPRECIATION_RATE;
      const trainingExp = decision.inv.labour; 
      const opEx = depreciation + trainingExp;
      
      // 3. Profit
      const grossProfit = revenue - cogs;
      const ebit = grossProfit - opEx;
      const ebt = ebit - interest;
      const tax = Math.max(0, ebt > 0 ? ebt * (setup.rates.tax/100) : 0); 
      const netIncome = ebt - tax;

      // 4. Cash Flow
      const cashIn = start.cash + revenue + decision.finance.newST + decision.finance.newLT;
      const cashOut = totalProdCost + trainingExp + interest + tax + decision.inv.machine + decision.finance.payST + decision.finance.payLT + decision.finance.div;
      const endCash = cashIn - cashOut;

      // 5. Balance Sheet
      const endFixedAssets = start.fixedAssets - depreciation + decision.inv.machine;
      const endTotalAssets = endCash + totalInventoryValue + endFixedAssets;
      const endRE = start.retainedEarnings + netIncome - decision.finance.div;
      const endEquity = start.equity + endRE - start.retainedEarnings; 
      const endTotalLiabEquity = endST + endLT + endEquity;
      const totalDebt = endST + endLT;

      // 6. Next Round State
      const addedMachineCap = (decision.inv.machine / 1000) * CAPACITY_PER_1000_MACHINE;
      const addedLabourCap = (decision.inv.labour / 1000) * CAPACITY_PER_1000_LABOUR;
      const nextLimits = {
        machine: start.limits.machine + addedMachineCap,
        labour: start.limits.labour + addedLabourCap,
        material: 100000 
      };
      const totalInv = decision.inv.machine + decision.inv.labour;
      const addedEfficiency = (totalInv / 10000) * EFFICIENCY_GAIN_PER_10K_INV;
      const nextEfficiency = prevEfficiency + addedEfficiency;

      // 7. Ratios
      const roe = endEquity > 0 ? (netIncome / endEquity) * 100 : 0;
      const roa = endTotalAssets > 0 ? (netIncome / endTotalAssets) * 100 : 0;
      const assetTurnover = endTotalAssets > 0 ? revenue / endTotalAssets : 0;
      const equityMultiplier = endEquity > 0 ? endTotalAssets / endEquity : 0;
      const debtEquityRatio = endEquity > 0 ? totalDebt / endEquity : 0;

      return {
        financials: { 
            revenue, 
            varCost: cogs, 
            grossProfit,
            depreciation,
            trainingExp,
            ebit,
            interest, 
            tax,
            netIncome, 
            roe,
            roa,
            assetTurnover,
            equityMultiplier,
            debtEquityRatio,
            // Balance Sheet Items
            cash: endCash, 
            inventory: totalInventoryValue, 
            inventoryUnits: totalInventoryUnits, 
            fixedAssets: endFixedAssets,
            totalAssets: endTotalAssets,
            stDebt: endST,
            ltDebt: endLT,
            equity: endEquity,
            totalLiabEquity: endTotalLiabEquity,
            totalUnitsSold 
        },
        flags: {
            salesCapped,
            maxRatePossible
        },
        inventoryDetails: nextInventoryDetails,
        limits: start.limits, 
        usage: { machine: machineHoursUsed, labour: labourHoursUsed },
        nextStart: {
          cash: endCash,
          inventory: totalInventoryValue, 
          fixedAssets: endFixedAssets,
          stDebt: endST,
          ltDebt: endLT,
          equity: endEquity, 
          retainedEarnings: endRE,
          limits: nextLimits
        },
        nextEfficiency,
        capacityCheck: {
            machine: { used: machineHoursUsed, limit: start.limits.machine, safe: machineHoursUsed <= start.limits.machine },
            labour: { used: labourHoursUsed, limit: start.limits.labour, safe: labourHoursUsed <= start.limits.labour }
        }
      };
    };

    const initialInvDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

    const y1Start = { ...setup, limits: setup.limits }; 
    const r1Res = calculateYear(y1Start, decisions.r1, 0, initialInvDetails);
    const r2Res = calculateYear(r1Res.nextStart, decisions.r2, r1Res.nextEfficiency, r1Res.inventoryDetails);
    const r3Res = calculateYear(r2Res.nextStart, decisions.r3, r2Res.nextEfficiency, r2Res.inventoryDetails);

    return { r1: r1Res, r2: r2Res, r3: r3Res };
  }, [setup, decisions]);

  // --- GRID DATA STRUCTURE ---
  const gridRows = useMemo(() => {
      const rawRows = [
          // OPERATIONS
          { type: 'header', label: 'OPERATIONS', section: 'ops', icon: <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />, hint: "Strategy Tip: Calculate Contribution Margin per Bottleneck Hour to set optimal mix." },
          { type: 'input', label: 'Sales Plan %', id: 'general.salesRate', format: 'number', suffix: '%', section: 'ops', tooltip: "Sales / Production. >100% sells from inventory. Capped by available stock." },
          { type: 'output', label: 'Total Sold (Units)', id: 'totalUnitsSold', format: 'number', section: 'ops', highlight: false },
          { type: 'input', label: 'Prod A Qty', id: 'qty.A', format: 'number', section: 'ops' },
          { type: 'input', label: 'Prod A Price', id: 'price.A', format: 'currency', section: 'ops' },
          { type: 'input', label: 'Prod B Qty', id: 'qty.B', format: 'number', section: 'ops' },
          { type: 'input', label: 'Prod B Price', id: 'price.B', format: 'currency', section: 'ops' },
          { type: 'input', label: 'Prod C Qty', id: 'qty.C', format: 'number', section: 'ops' },
          { type: 'input', label: 'Prod C Price', id: 'price.C', format: 'currency', section: 'ops' },
          
          // CAPACITY
          { type: 'header', label: 'CAPACITY & UTILIZATION', section: 'cap' },
          { type: 'displayLimit', label: 'Machine Limit (Hrs)', id: 'machine', section: 'cap', tooltip: "Max production hours available. Grows if you invest in Machines." },
          { type: 'status', label: 'Machine Usage', id: 'machine', section: 'cap', tooltip: "Tip: Utilizing near 100% spreads fixed costs efficiently. Do not exceed 100%." },
          { type: 'displayLimit', label: 'Labour Limit (Hrs)', id: 'labour', section: 'cap', tooltip: "Max labour hours available. Grows if you invest in Labour." },
          { type: 'status', label: 'Labour Usage', id: 'labour', section: 'cap' },
          
          // GROWTH
          { type: 'header', label: 'GROWTH (CAPEX & EXPENSE)', section: 'growth' },
          { type: 'input', label: 'Machine Inv ($)', id: 'inv.machine', format: 'currency', section: 'growth', tooltip: "$1,000 Inv = +50 Machine Hrs. Also offsets Depreciation." },
          { type: 'input', label: 'Labour Inv ($)', id: 'inv.labour', format: 'currency', section: 'growth', tooltip: "Expensed as Training. Adds to Labour Limit." },

          // FINANCE
          { type: 'header', label: 'FINANCE', section: 'fin' },
          { type: 'input', label: 'New ST Debt (+)', id: 'finance.newST', format: 'currency', section: 'fin', tooltip: "1-Year Loan. High interest rate (10%)." },
          { type: 'input', label: 'New LT Debt (+)', id: 'finance.newLT', format: 'currency', section: 'fin', tooltip: "10-Year Loan. Lower interest rate (5%)." },
          { type: 'input', label: 'Pay ST Princ (-)', id: 'finance.payST', format: 'currency', section: 'fin', tooltip: "Repay Short-Term Debt principal." },
          { type: 'input', label: 'Pay LT Princ (-)', id: 'finance.payLT', format: 'currency', section: 'fin', tooltip: "Repay Long-Term Debt principal." },
          { type: 'input', label: 'Dividends (-)', id: 'finance.div', format: 'currency', section: 'fin', tooltip: "Pay cash to shareholders. Reduces Cash and Equity." },

          // INCOME STATEMENT
          { type: 'header', label: 'INCOME STATEMENT', section: 'inc' },
          { type: 'output', label: 'Revenue', id: 'revenue', format: 'currency', section: 'inc' },
          { type: 'output', label: 'COGS (Var)', id: 'varCost', format: 'currency', negative: true, section: 'inc', tooltip: "Variable costs for SOLD units only. Uses FIFO." },
          { type: 'output', label: 'Gross Profit', id: 'grossProfit', format: 'currency', highlight: true, section: 'inc' },
          { type: 'spacer', label: '', section: 'inc' },
          { type: 'output', label: 'Depreciation', id: 'depreciation', format: 'currency', negative: true, section: 'inc', tooltip: "5% of Start Fixed Assets. Reduces Net Income and Asset Value." },
          { type: 'output', label: 'Training & Dev', id: 'trainingExp', format: 'currency', negative: true, section: 'inc' },
          { type: 'output', label: 'EBIT', id: 'ebit', format: 'currency', section: 'inc' },
          { type: 'output', label: 'Interest', id: 'interest', format: 'currency', negative: true, section: 'inc' },
          { type: 'output', label: 'Taxes', id: 'tax', format: 'currency', negative: true, section: 'inc', tooltip: "30% of EBT (Earnings Before Tax)." },
          { type: 'output', label: 'Net Income', id: 'netIncome', format: 'currency', highlight: true, section: 'inc' },
          
          // METRICS
          { type: 'header', label: 'METRICS', section: 'met' },
          { type: 'output', label: 'ROE %', id: 'roe', format: 'percent', highlight: true, section: 'met', tooltip: "Return on Equity = Net Income / Total Equity" },
          { type: 'output', label: 'ROA %', id: 'roa', format: 'percent', highlight: false, section: 'met', tooltip: "Return on Assets = Net Income / Total Assets" },
          { type: 'output', label: 'Asset Turnover', id: 'assetTurnover', format: 'decimal', highlight: false, section: 'met', tooltip: "Revenue / Total Assets. Indicates efficiency." },
          { type: 'output', label: 'Equity Multiplier', id: 'equityMultiplier', format: 'decimal', highlight: false, section: 'met', tooltip: "Total Assets / Total Equity. Indicates leverage." },
          { type: 'output', label: 'Debt/Equity', id: 'debtEquityRatio', format: 'decimal', highlight: false, section: 'met', tooltip: "Total Debt / Total Equity. Indicates solvency." },

          // FINANCIAL POSITION
          { type: 'header', label: 'FINANCIAL POSITION', section: 'pos' },
          { type: 'output', label: 'Cash', id: 'cash', format: 'currency', checkNegative: true, section: 'pos' },
          { type: 'output', label: 'Inventory (Units)', id: 'inventoryUnits', format: 'number', section: 'pos', highlight: false },
          { type: 'output', label: 'Inventory ($)', id: 'inventory', format: 'currency', section: 'pos', tooltip: "Value of Unsold Finished Goods. Uses specific unit cost." },
          { type: 'output', label: 'Fixed Assets', id: 'fixedAssets', format: 'currency', section: 'pos', tooltip: "Book Value. Formula: Start Assets - Depreciation + New Inv." },
          { type: 'output', label: 'Total Assets', id: 'totalAssets', format: 'currency', highlight: true, section: 'pos' },
          { type: 'spacer', label: '', section: 'pos' }, 
          { type: 'output', label: 'ST Debt', id: 'stDebt', format: 'currency', section: 'pos' },
          { type: 'output', label: 'LT Debt', id: 'ltDebt', format: 'currency', section: 'pos' },
          { type: 'output', label: 'Equity', id: 'equity', format: 'currency', section: 'pos' },
          { type: 'output', label: 'Total Liab. & Equity', id: 'totalLiabEquity', format: 'currency', highlight: true, section: 'pos' },
      ];

      return rawRows;
  }, []);

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

  const formatVal = (val, format) => {
      if (format === 'currency') return `$${val.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
      if (format === 'percent') return `${val.toFixed(1)}%`;
      if (format === 'decimal') return val.toFixed(2);
      if (format === 'number') return val.toLocaleString(undefined, {maximumFractionDigits: 0});
      return val.toLocaleString();
  };

  // --- Ticket Generation ---
  const ticketData = useMemo(() => {
    if (!firmId) return "Please enter a Firm ID above first.";
    
    let txt = "";
    let currentGroup = "";

    gridRows.forEach(row => {
        if (row.type === 'header') {
            currentGroup = row.label;
        } else if (row.type !== 'spacer') {
            // Determine value for Round 1
            let val = '';
            if (row.type === 'input') {
                const [cat, field] = row.id.split('.');
                val = decisions.r1[cat][field];
            } else if (row.type === 'displayLimit') {
                val = simulation.r1.limits[row.id];
            } else if (row.type === 'status') {
                const status = simulation.r1.capacityCheck[row.id];
                val = status.limit > 0 ? (status.used / status.limit) : 0; // Raw decimal
            } else if (row.type === 'output') {
                val = simulation.r1.financials[row.id];
            }
            
            // Format: FirmID | Group | Item | Value
            // Using raw numbers for easy excel pasting
            txt += `${firmId}\t${currentGroup}\t${row.label}\t${val}\n`;
        }
    });
    return txt;
  }, [firmId, gridRows, decisions, simulation]);

  const copyTicket = () => {
      navigator.clipboard.writeText(ticketData);
      alert("Ticket copied to clipboard!");
  };

  // --- CSV Download Function ---
  const downloadCSV = () => {
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
            {showSetup && (
            <Card>
                <div 
                    className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100"
                    onClick={() => setShowSetup(!showSetup)}
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Settings className="w-4 h-4" /> 1. Initial Position (From Instructor Report)
                    </div>
                    <div className="text-xs text-indigo-600 font-bold">Collapse</div>
                </div>
                
                <div className="p-6">
                    {/* WARNING BOX */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-3 text-sm text-amber-900">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <strong className="block text-amber-800">Confidential Strategy Information</strong>
                            Enter the starting values from your specific Company Brief here. 
                            Do not share this specific starting position with competitors. 
                            <br/><span className="text-amber-700 mt-1 block">Game Timing: Decisions are made annually. Projections (R2, R3) assume similar conditions unless edited.</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                        {/* Setup Inputs */}
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Assets</span>
                            <div className="mt-2 space-y-1">
                                <label className="flex justify-between items-center"><span>Cash</span> <input type="number" className="w-20 border rounded px-1" value={setup.cash} onChange={e => setSetup({...setup, cash: parseFloat(e.target.value)||0})} /></label>
                                <label className="flex justify-between items-center"><span>Machines</span> <input type="number" className="w-20 border rounded px-1" value={setup.fixedAssets} onChange={e => setSetup({...setup, fixedAssets: parseFloat(e.target.value)||0})} /></label>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Liabilities</span>
                            <div className="mt-2 space-y-1">
                                <label className="flex justify-between items-center"><span>ST Debt</span> <input type="number" className="w-20 border rounded px-1" value={setup.stDebt} onChange={e => setSetup({...setup, stDebt: parseFloat(e.target.value)||0})} /></label>
                                <label className="flex justify-between items-center"><span>LT Debt</span> <input type="number" className="w-20 border rounded px-1" value={setup.ltDebt} onChange={e => setSetup({...setup, ltDebt: parseFloat(e.target.value)||0})} /></label>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Equity</span>
                            <div className="mt-2 space-y-1">
                                <label className="flex justify-between items-center"><span>Capital</span> <input type="number" className="w-20 border rounded px-1" value={setup.equity} onChange={e => setSetup({...setup, equity: parseFloat(e.target.value)||0})} /></label>
                                <label className="flex justify-between items-center"><span>Ret. Earn</span> <input type="number" className="w-20 border rounded px-1" value={setup.retainedEarnings} onChange={e => setSetup({...setup, retainedEarnings: parseFloat(e.target.value)||0})} /></label>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Rates & Limits</span>
                            <div className="mt-2 space-y-1">
                                <label className="flex justify-between items-center"><span>ST Rate %</span> <input type="number" className="w-16 border rounded px-1" value={setup.rates.st} onChange={e => setSetup({...setup, rates: {...setup.rates, st: parseFloat(e.target.value)||0}})} /></label>
                                <label className="flex justify-between items-center"><span>Tax Rate %</span> <input type="number" className="w-16 border rounded px-1" value={setup.rates.tax} onChange={e => setSetup({...setup, rates: {...setup.rates, tax: parseFloat(e.target.value)||0}})} /></label>
                                <label className="flex justify-between items-center"><span>Mach Cap</span> <input type="number" className="w-16 border rounded px-1" value={setup.limits.machine} onChange={e => setSetup({...setup, limits: {...setup.limits, machine: parseFloat(e.target.value)||0}})} /></label>
                                <label className="flex justify-between items-center"><span>Lab Cap</span> <input type="number" className="w-16 border rounded px-1" value={setup.limits.labour} onChange={e => setSetup({...setup, limits: {...setup.limits, labour: parseFloat(e.target.value)||0}})} /></label>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            )}

            {/* 2. THE MASTER GRID */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Strategic Planner</h3>
                <div className="text-xs text-slate-500">
                    <span className="inline-block w-3 h-3 bg-indigo-50 border border-indigo-200 mr-1 align-middle"></span> 
                    Decision Round (1)
                </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                                <th className="p-3 text-left w-48 border-r border-slate-200 font-bold">Metric</th>
                                <th className="p-3 w-40 border-r border-indigo-100 bg-indigo-50 text-indigo-900 font-bold border-b-2 border-b-indigo-500">Round 1 (Decision)</th>
                                <th className="p-3 w-40 border-r border-slate-200">Round 2 (Proj)</th>
                                <th className="p-3 w-40">Round 3 (Proj)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridRows.map((row, idx) => {
                                // Section Header with Collapse/Expand Logic
                                if (row.type === 'header') {
                                    const isCollapsed = collapsed[row.section];
                                    return (
                                        <tr 
                                            key={idx} 
                                            className="bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => toggleSection(row.section)}
                                        >
                                            <td colSpan={4} className="p-2 pl-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-y border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        {isCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                                        {row.label}
                                                    </div>
                                                    {/* Hint inside Header if present */}
                                                    {row.hint && (
                                                        <div className="flex items-center text-[10px] text-amber-600 font-normal normal-case mr-2">
                                                            {row.icon} {row.hint}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                // Hide row if section is collapsed
                                if (collapsed[row.section]) return null;
                                
                                // Spacer Row
                                if (row.type === 'spacer') {
                                    return (
                                        <tr key={idx}>
                                            <td colSpan={4} className="p-1 border-r border-slate-200"></td>
                                        </tr>
                                    )
                                }

                                // Data Rows
                                return (
                                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                        <td className="p-2 pl-4 font-medium text-slate-600 border-r border-slate-200 relative">
                                            {row.label}
                                            {row.tooltip && <Tooltip text={row.tooltip} />}
                                        </td>
                                        
                                        {['r1', 'r2', 'r3'].map(round => {
                                            const isDecision = round === 'r1';
                                            
                                            // 1. Input Cells
                                            if (row.type === 'input') {
                                                const val = decisions[round][row.id.split('.')[0]][row.id.split('.')[1]];
                                                // Check for warning flag specifically for salesRate
                                                const hasWarning = row.id === 'general.salesRate' && simulation[round].flags.salesCapped;
                                                
                                                return (
                                                    <td key={round} className={`p-1 border-r border-slate-200 ${isDecision ? 'bg-indigo-50/50' : ''}`}>
                                                        <InputCell 
                                                            value={val} 
                                                            onChange={(v) => updateVal(round, row.id, v)} 
                                                            prefix={row.format === 'currency' ? '$' : ''}
                                                            suffix={row.suffix}
                                                            warning={hasWarning}
                                                        />
                                                        {hasWarning && (
                                                            <div className="text-[9px] text-amber-600 font-bold text-right pr-2">
                                                                Max: {simulation[round].flags.maxRatePossible}%
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            }

                                            // 2. Display Limit Cells
                                            if (row.type === 'displayLimit') {
                                                const val = simulation[round].limits[row.id];
                                                return (
                                                    <td key={round} className="p-2 text-right text-slate-500 font-mono text-xs border-r border-slate-200">
                                                        {val.toLocaleString()}
                                                    </td>
                                                );
                                            }

                                            // 3. Status Cells (Percentage)
                                            if (row.type === 'status') {
                                                const status = simulation[round].capacityCheck[row.id];
                                                const pct = status.limit > 0 ? (status.used / status.limit) * 100 : 0;
                                                const isOver = pct > 100;
                                                
                                                return (
                                                    <td key={round} className={`p-2 text-right text-xs font-bold border-r border-slate-200 ${isOver ? 'text-red-600 bg-red-50' : 'text-emerald-600'}`}>
                                                        {pct.toFixed(0)}% {isOver && '(!)'}
                                                    </td>
                                                );
                                            }

                                            // 4. Output Cells
                                            if (row.type === 'output') {
                                                const val = simulation[round].financials[row.id];
                                                const isNegative = row.checkNegative && val < 0;
                                                return (
                                                    <td key={round} className={`p-2 text-right border-r border-slate-200 ${row.highlight ? 'bg-indigo-50 font-bold' : ''} ${isNegative || (row.negative && val > 0) ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {row.negative && val > 0 ? `(${formatVal(val, row.format)})` : formatVal(val, row.format)}
                                                    </td>
                                                );
                                            }
                                            return <td key={round}></td>;
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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
        {showSubmission && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5"/> Submission Ticket</h3>
                        <button onClick={() => setShowSubmission(false)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Firm ID</label>
                            <input 
                                type="text" 
                                value={firmId} 
                                onChange={(e) => setFirmId(e.target.value)} 
                                className="w-full border border-slate-300 rounded p-2 focus:border-indigo-500 outline-none" 
                                placeholder="Enter Group Name..." 
                            />
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">1. Copy Data</span>
                                <button onClick={copyTicket} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold">
                                    <Copy className="w-3 h-3" /> Copy to Clipboard
                                </button>
                            </div>
                            <textarea 
                                readOnly 
                                value={ticketData}
                                className="w-full h-64 font-mono text-xs p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onClick={(e) => e.target.select()}
                            />
                            <p className="text-center text-xs text-slate-400 mt-2">
                                Format: Firm ID | Group | Item | Value <br/>
                                Click text to select all, then Ctrl+C to copy.
                            </p>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-indigo-900 uppercase block">2. Submit Data</span>
                                <p className="text-xs text-indigo-700">Paste the copied data into the official form.</p>
                            </div>
                            <a 
                                href="https://forms.gle/t39WQg3pWq1ko8wP9" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                Go to Google Form <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}