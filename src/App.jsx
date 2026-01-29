import React, { useState, useMemo } from 'react';
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
  Lightbulb
} from 'lucide-react';

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

// --- Simple Chart Component (SVG) ---
const SimpleChart = ({ title, data, dataKey, color = "#4f46e5", format = "currency" }) => {
  const height = 150;
  const width = 300;
  const padding = 20;
  
  const values = data.map(d => d[dataKey]);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = (max - min) || 1; // avoid divide by zero

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
          {/* Axis Lines */}
          <line x1={padding} y1={getY(0)} x2={width-padding} y2={getY(0)} stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Line Path */}
          <polyline
            points={data.map((d, i) => {
              const x = padding + (i * ((width - (padding*2)) / (data.length - 1)));
              return `${x},${getY(d[dataKey])}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />

          {/* Dots & Labels */}
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

// --- Constants & Helper Functions ---

const DEPRECIATION_RATE = 0.05; 
const CAPACITY_PER_1000_MACHINE = 50; // Hours
const CAPACITY_PER_1000_LABOUR = 100; // Hours
const EFFICIENCY_GAIN_PER_10K_INV = 0.01; // 1% cost reduction per $10k invested

// Recipe (Standard Resource Requirements per Unit)
const RECIPE = {
  machine: { A: 2.0, B: 1.5, C: 1.0 },
  labour: { A: 1.0, B: 1.5, C: 2.0 },
  material: { A: 1.0, B: 1.0, C: 1.0 }
};

// Standard Costs (Base Level)
const BASE_COSTS = {
  machine: 10,
  labour: 8,
  material: 5
};

export default function StratFi() {
  
  // --- STATE: View Mode ---
  const [view, setView] = useState('grid'); 

  // --- STATE: Initial Setup ---
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

  // --- STATE: Decisions (Inputs) ---
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
  const [showSetup, setShowSetup] = useState(true);

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
    // startInventoryDetails: Object { A: { units: 0, value: 0 }, ... }
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
      
      // Store ending inventory state for next round
      const nextInventoryDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

      // Helper: FIFO Sales Logic
      const products = ['A', 'B', 'C'];
      
      let salesCapped = false;
      let maxRatePossible = 0;

      products.forEach(p => {
        const prodQty = decision.qty[p];
        
        // Resource Usage
        machineHoursUsed += prodQty * RECIPE.machine[p];
        labourHoursUsed += prodQty * RECIPE.labour[p];
        
        // Current Production Unit Cost
        const unitMachineCost = RECIPE.machine[p] * BASE_COSTS.machine;
        const unitLabourCost = RECIPE.labour[p] * BASE_COSTS.labour;
        const unitMatCost = RECIPE.material[p] * BASE_COSTS.material;
        const currentUnitCost = (unitMachineCost + unitLabourCost + unitMatCost) * costMultiplier;

        totalProdCost += prodQty * currentUnitCost; // Cash Outflow

        // --- FIFO SALES LOGIC ---
        // 1. Identify Available Stock
        const oldUnits = startInventoryDetails ? startInventoryDetails[p].units : 0;
        const oldTotalValue = startInventoryDetails ? startInventoryDetails[p].value : 0;
        const oldUnitCost = oldUnits > 0 ? oldTotalValue / oldUnits : 0;

        // 2. Determine Demand
        let demand = prodQty * salesRate; // Sales plan applies to production volume base
        // If prod is 0 but we have inventory, allow selling from inventory if rate > 0
        if (prodQty === 0 && oldUnits > 0 && salesRate > 0) {
             // If prod is 0, we can interpret salesRate as % of Inventory? 
             // Or keep it simple: Sales Plan is usually around 100%. 
             // If Prod=0, Sales=0 with current formula. 
             // LIMITATION: Users must produce to generate the "demand signal" in this simple model.
             demand = 0; 
        }

        // Cap demand at total available
        if (demand > (oldUnits + prodQty)) {
            salesCapped = true;
            // Calculate effective max rate for UI warning
            if (prodQty > 0) maxRatePossible = ((oldUnits + prodQty) / prodQty * 100).toFixed(0);
            demand = oldUnits + prodQty;
        }

        // 3. Fulfill Demand (FIFO: Old first, then New)
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

        // 4. Calculate Revenue & COGS
        revenue += (soldFromOld + soldFromNew) * decision.price[p];
        
        // FIFO Costing
        const cogsOld = soldFromOld * oldUnitCost;
        const cogsNew = soldFromNew * currentUnitCost;
        cogs += (cogsOld + cogsNew);

        // 5. Update Ending Inventory
        const endUnitsOld = oldUnits - soldFromOld;
        const endUnitsNew = prodQty - soldFromNew;
        const endValueOld = endUnitsOld * oldUnitCost; // Remaining old value
        const endValueNew = endUnitsNew * currentUnitCost; // Remaining new value

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
            inventoryUnits: totalInventoryUnits, // New Metric
            fixedAssets: endFixedAssets,
            totalAssets: endTotalAssets,
            stDebt: endST,
            ltDebt: endLT,
            equity: endEquity,
            totalLiabEquity: endTotalLiabEquity,
            totalUnitsSold // New Metric
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
          inventory: totalInventoryValue, // $ Value
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

    // Initial Inventory State (Empty for R1 start)
    const initialInvDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

    const y1Start = { ...setup, limits: setup.limits }; 
    // R1 Calculation
    const r1Res = calculateYear(y1Start, decisions.r1, 0, initialInvDetails);
    // R2 Calculation (Pass R1 ending inventory)
    const r2Res = calculateYear(r1Res.nextStart, decisions.r2, r1Res.nextEfficiency, r1Res.inventoryDetails);
    // R3 Calculation (Pass R2 ending inventory)
    const r3Res = calculateYear(r2Res.nextStart, decisions.r3, r2Res.nextEfficiency, r2Res.inventoryDetails);

    return { r1: r1Res, r2: r2Res, r3: r3Res };
  }, [setup, decisions]);

  // --- GRID DATA STRUCTURE ---
  const gridRows = useMemo(() => {
      // Define rows with section keys
      const rawRows = [
          // OPERATIONS
          { type: 'header', label: 'OPERATIONS', section: 'ops', icon: <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />, hint: "Strategy Tip: Calculate Contribution Margin per Bottleneck Hour to set optimal mix." },
          { type: 'input', label: 'Sales Plan %', id: 'general.salesRate', format: 'number', suffix: '%', section: 'ops', tooltip: "Sales / Production. >100% sells from inventory. Capped by available stock." },
          { type: 'output', label: 'Total Sold (Units)', id: 'totalUnitsSold', format: 'number', section: 'ops', highlight: false }, // NEW ROW
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
          { type: 'output', label: 'Inventory (Units)', id: 'inventoryUnits', format: 'number', section: 'pos', highlight: false }, // NEW ROW
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
        <div className="flex bg-slate-100 p-1 rounded-lg">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* VIEW: GRID (PLANNER) */}
        {view === 'grid' && (
          <>
            {/* 1. INITIAL SETUP */}
            <Card>
                <div 
                    className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100"
                    onClick={() => setShowSetup(!showSetup)}
                >
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Settings className="w-4 h-4" /> 1. Initial Position (From Instructor Report)
                    </div>
                    <div className="text-xs text-indigo-600 font-bold">{showSetup ? "Collapse" : "Expand"}</div>
                </div>
                {showSetup && (
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
                )}
            </Card>

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
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5"/> Submission Ticket</h3>
                        <button onClick={() => setShowSubmission(false)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6">
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
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono space-y-2">
                            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2 mb-2">
                                <div><strong>Prod A:</strong> {decisions.r1.qty.A} @ ${decisions.r1.price.A}</div>
                                <div><strong>Prod B:</strong> {decisions.r1.qty.B} @ ${decisions.r1.price.B}</div>
                                <div><strong>Prod C:</strong> {decisions.r1.qty.C} @ ${decisions.r1.price.C}</div>
                            </div>
                            <div className="flex justify-between text-emerald-700">
                                <span>Inv Machine: ${decisions.r1.inv.machine}</span>
                                <span>Inv Labour: ${decisions.r1.inv.labour}</span>
                            </div>
                            <div className="flex justify-between text-indigo-700">
                                <span>New ST: ${decisions.r1.finance.newST}</span>
                                <span>New LT: ${decisions.r1.finance.newLT}</span>
                            </div>
                            <div className="flex justify-between text-indigo-700">
                                <span>Div: ${decisions.r1.finance.div}</span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Copy these values to your Google Form.</p>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}