import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Package, 
  Briefcase,
  Lightbulb,
  Banknote,
  ClipboardList,
  Info,
  X,
  Landmark,
  Scale,
  Percent
} from 'lucide-react';

// --- UI Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, icon: Icon, color = "text-slate-700" }) => (
  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
    {Icon && <Icon className={`w-5 h-5 ${color}`} />}
    <h3 className="font-semibold text-slate-800">{title}</h3>
  </div>
);

const MetricCard = ({ label, value, subtext, highlight = false, alert = false }) => (
  <div className={`p-4 rounded-lg border ${alert ? 'bg-red-50 border-red-200' : highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
    <div className="text-sm text-slate-500 font-medium mb-1">{label}</div>
    <div className={`text-2xl font-bold ${alert ? 'text-red-700' : highlight ? 'text-indigo-700' : 'text-slate-800'}`}>{value}</div>
    {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
  </div>
);

const ProgressBar = ({ label, current, max, unit = "" }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  const isOverLimit = current > max;
  const isNearLimit = !isOverLimit && percentage > 90;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`${isOverLimit ? 'text-red-600 font-bold' : isNearLimit ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`} 
          style={{ width: `${isOverLimit ? 100 : percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, prefix = "", suffix = "", min = 0, step = 1 }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type="number"
        min={min}
        step={step}
        className={`block w-full ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-400 sm:text-sm">{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

// --- Main Application ---

export default function ProductionSim() {
  // --- Constants ---
  const DEPRECIATION_RATE = 0.05; // 5% linear depreciation per round

  // --- State ---
  
  // 1. Initial Balance Sheet & Rates
  const [initialBalance, setInitialBalance] = useState({
    cash: 10000,
    inventory: 5000,
    fixedAssets: 20000, // Machines
    shortTermDebt: 0,
    longTermDebt: 0,
    equity: 25000, // Common Stock / Capital (Increased to balance)
    retainedEarnings: 10000
  });

  // 1b. Market Rates
  const [rates, setRates] = useState({
    st: 10.0, // Short Term Interest Rate %
    lt: 5.0   // Long Term Interest Rate %
  });

  // Resources Available (Derived mostly from Balance Sheet now, except hours)
  const [operationalLimits, setOperationalLimits] = useState({
    machineHrs: 1000,
    labourHrs: 1000,
    materialUnits: 500
  });

  // Unit Costs
  const [costs, setCosts] = useState({
    machine: 10,
    labour: 8,
    material: 5
  });

  // Decisions: Production & Price
  const [production, setProduction] = useState({ A: 0, B: 0, C: 0 });
  const [prices, setPrices] = useState({ A: 33, B: 32, C: 31 });

  // Decisions: Investments & Finance
  const [investments, setInvestments] = useState({ machine: 0, labour: 0 });
  const [dividends, setDividends] = useState(0);
  const [financing, setFinancing] = useState({ newST: 0, newLT: 0 }); // New Debt Requested
  const [firmId, setFirmId] = useState("");

  // Constants (Recipes)
  const requirements = {
    machine: { A: 2.0, B: 1.5, C: 1.0 },
    labour: { A: 1.0, B: 1.5, C: 2.0 },
    material: { A: 1.0, B: 1.0, C: 1.0 }
  };

  // --- Calculations ---

  const calculated = useMemo(() => {
    // 1. Calculate Usage
    const machineUse = (production.A * requirements.machine.A) + (production.B * requirements.machine.B) + (production.C * requirements.machine.C);
    const labourUse = (production.A * requirements.labour.A) + (production.B * requirements.labour.B) + (production.C * requirements.labour.C);
    const matUse = (production.A * requirements.material.A) + (production.B * requirements.material.B) + (production.C * requirements.material.C);

    // 2. Variable Costs & Unit Economics
    const products = ['A', 'B', 'C'];
    const analysis = {};
    let totalVariableCost = 0;

    products.forEach(p => {
        const unitVarCost = 
            (requirements.machine[p] * costs.machine) + 
            (requirements.labour[p] * costs.labour) + 
            (requirements.material[p] * costs.material);
        
        const unitMargin = prices[p] - unitVarCost;
        
        analysis[p] = {
            unitVarCost,
            unitMargin,
            marginPerMachine: unitMargin / requirements.machine[p],
            marginPerLabour: unitMargin / requirements.labour[p]
        };

        totalVariableCost += production[p] * unitVarCost;
    });

    // 3. Fixed Expenses Calculation (On Initial Balances)
    // Interest is calculated on Beginning Balance (standard convention) using DYNAMIC RATES
    const interestExpense = (initialBalance.shortTermDebt * (rates.st / 100)) + (initialBalance.longTermDebt * (rates.lt / 100));
    const depreciationExpense = initialBalance.fixedAssets * DEPRECIATION_RATE;

    // 4. Cash Logic
    const totalInvestments = investments.machine + investments.labour;
    const newDebtInflow = financing.newST + financing.newLT;
    
    // Total Cash Required = Production Costs + Interest + Investments + Dividends
    // Note: We assume interest on *initial* debt is paid now.
    const totalCashOut = totalVariableCost + interestExpense + totalInvestments + dividends;
    const availableCash = initialBalance.cash + newDebtInflow;

    // 5. Feasibility Check
    const isMachineFeasible = machineUse <= operationalLimits.machineHrs;
    const isLabourFeasible = labourUse <= operationalLimits.labourHrs;
    const isMatFeasible = matUse <= operationalLimits.materialUnits;
    const isCashFeasible = totalCashOut <= availableCash; 
    
    const isFeasible = isMachineFeasible && isLabourFeasible && isMatFeasible && isCashFeasible;

    // 6. Pro-Forma Income Statement (Assuming 100% Sales)
    const revenue = (production.A * prices.A) + (production.B * prices.B) + (production.C * prices.C);
    const cogs = totalVariableCost;
    const grossProfit = revenue - cogs;
    
    const trainingExpense = investments.labour; // Expensed immediately
    const operatingExpenses = depreciationExpense + trainingExpense; 
    
    const ebit = grossProfit - operatingExpenses;
    const netIncome = ebit - interestExpense;

    // 7. Pro-Forma Balance Sheet (Projected)
    // Assets
    const cashEnd = availableCash - totalCashOut + revenue;
    const inventoryEnd = initialBalance.inventory; 
    
    const fixedAssetsNet = initialBalance.fixedAssets - depreciationExpense + investments.machine;
    const totalAssets = cashEnd + inventoryEnd + fixedAssetsNet;

    // Liabilities & Equity
    const totalShortTermDebt = initialBalance.shortTermDebt + financing.newST;
    const totalLongTermDebt = initialBalance.longTermDebt + financing.newLT;
    const totalLiabilities = totalShortTermDebt + totalLongTermDebt;
    
    const endingRetainedEarnings = initialBalance.retainedEarnings + netIncome - dividends;
    const totalEquity = initialBalance.equity + endingRetainedEarnings;

    // DuPont Metrics
    const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
    const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;

    return {
      usage: { machine: machineUse, labour: labourUse, material: matUse },
      cashFlow: { 
        available: availableCash, 
        required: totalCashOut, 
        inflowDebt: newDebtInflow 
      },
      feasibility: { all: isFeasible, machine: isMachineFeasible, labour: isLabourFeasible, material: isMatFeasible, cash: isCashFeasible },
      financials: { 
        revenue, cogs, grossProfit, 
        depreciation: depreciationExpense,
        training: trainingExpense,
        interest: interestExpense,
        netIncome,
        
        cashEnd, inventoryEnd, fixedAssetsNet, totalAssets,
        totalShortTermDebt, totalLongTermDebt, totalLiabilities, 
        totalEquity, endingRetainedEarnings,
        roe, roa
      },
      analysis
    };
  }, [initialBalance, rates, operationalLimits, costs, production, prices, requirements, investments, dividends, financing]);

  // --- Handlers ---
  const handleProductionChange = (product, val) => setProduction(prev => ({ ...prev, [product]: val }));
  const handlePriceChange = (product, val) => setPrices(prev => ({ ...prev, [product]: val }));

  const [activeTab, setActiveTab] = useState('income');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-600" />
              Production Planner
            </h1>
            <p className="text-slate-500 mt-1">
               DuPont Analysis & Financial Planning
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${calculated.feasibility.all ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {calculated.feasibility.all ? <TrendingUp className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
                {calculated.feasibility.all ? 'Plan Feasible' : 'Constraints Violated'}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Inputs & Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Initial Setup (Collapsible) */}
          <Card>
            <div 
                className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setShowInitialSetup(!showInitialSetup)}
            >
                <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-slate-700" />
                    <h3 className="font-semibold text-slate-800">1. Initial Setup</h3>
                </div>
                <div className="text-xs text-indigo-600 font-bold">{showInitialSetup ? "Hide" : "Edit"}</div>
            </div>
            
            {showInitialSetup && (
                <div className="p-6 bg-white text-sm">
                    {/* Market Rates Section */}
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Percent className="w-3 h-3" /> Market Interest Rates (%)
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Short-Term Rate" suffix="%" value={rates.st} step={0.1} onChange={(v) => setRates({...rates, st: v})} />
                        <InputGroup label="Long-Term Rate" suffix="%" value={rates.lt} step={0.1} onChange={(v) => setRates({...rates, lt: v})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assets</div>
                      <InputGroup label="Cash" prefix="$" value={initialBalance.cash} onChange={(v) => setInitialBalance({...initialBalance, cash: v})} />
                      <InputGroup label="Inventory" prefix="$" value={initialBalance.inventory} onChange={(v) => setInitialBalance({...initialBalance, inventory: v})} />
                      <div className="col-span-2"><InputGroup label="Fixed Assets (Machine)" prefix="$" value={initialBalance.fixedAssets} onChange={(v) => setInitialBalance({...initialBalance, fixedAssets: v})} /></div>
                      
                      <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">Liabilities</div>
                      <InputGroup label="Short Term Debt" prefix="$" value={initialBalance.shortTermDebt} onChange={(v) => setInitialBalance({...initialBalance, shortTermDebt: v})} />
                      <InputGroup label="Long Term Debt" prefix="$" value={initialBalance.longTermDebt} onChange={(v) => setInitialBalance({...initialBalance, longTermDebt: v})} />
                      
                      <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">Equity</div>
                      <InputGroup label="Capital Stock" prefix="$" value={initialBalance.equity} onChange={(v) => setInitialBalance({...initialBalance, equity: v})} />
                      <InputGroup label="Retained Earn." prefix="$" value={initialBalance.retainedEarnings} onChange={(v) => setInitialBalance({...initialBalance, retainedEarnings: v})} />
                    </div>
                </div>
            )}
            {!showInitialSetup && (
                <div className="p-4 flex flex-col gap-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Assets: ${(initialBalance.cash + initialBalance.inventory + initialBalance.fixedAssets).toLocaleString()}</span>
                      <span>Rates: {rates.st}% / {rates.lt}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eq+Liab: ${(initialBalance.shortTermDebt + initialBalance.longTermDebt + initialBalance.equity + initialBalance.retainedEarnings).toLocaleString()}</span>
                    </div>
                </div>
            )}
          </Card>

          {/* Operational Limits */}
          <Card>
            <CardHeader title="2. Operational Limits" icon={Package} />
            <div className="p-6 grid grid-cols-2 gap-4 bg-white">
               <InputGroup label="Machine Hrs" value={operationalLimits.machineHrs} onChange={(v) => setOperationalLimits({...operationalLimits, machineHrs: v})} />
               <InputGroup label="Labour Hrs" value={operationalLimits.labourHrs} onChange={(v) => setOperationalLimits({...operationalLimits, labourHrs: v})} />
               <InputGroup label="Materials" value={operationalLimits.materialUnits} onChange={(v) => setOperationalLimits({...operationalLimits, materialUnits: v})} />
               <div className="opacity-50 pointer-events-none">
                 <InputGroup label="Cash Avail." prefix="$" value={calculated.cashFlow.available} onChange={() => {}} />
               </div>
            </div>
          </Card>

          {/* 2. Production */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader title="3. Operations Plan" icon={Briefcase} color="text-indigo-600" />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-400">Product</span>
                <span className="text-xs font-bold text-slate-400">Qty</span>
                <span className="text-xs font-bold text-slate-400">Price ($)</span>
              </div>
              {['A', 'B', 'C'].map((prod) => (
                <div key={prod} className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-bold text-slate-700 bg-slate-100 rounded-md py-2 text-center">{prod}</div>
                  <InputGroup label="" value={production[prod]} onChange={(v) => handleProductionChange(prod, v)} />
                  <InputGroup label="" prefix="$" value={prices[prod]} onChange={(v) => handlePriceChange(prod, v)} />
                </div>
              ))}
            </div>

            {/* STRATEGIC ANALYSIS PANEL */}
            {showAnalysis && (
              <div className="mx-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex justify-between items-center mb-3">
                         <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4"/> Unit Economics
                         </h4>
                         <button onClick={() => setShowAnalysis(false)} className="text-amber-600 hover:text-amber-800">
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                              <thead>
                                  <tr className="border-b border-amber-200">
                                      <th className="pb-2 text-amber-800">Metric</th>
                                      <th className="pb-2 text-center">A</th>
                                      <th className="pb-2 text-center">B</th>
                                      <th className="pb-2 text-center">C</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr className="border-b border-amber-100">
                                      <td className="py-2 text-slate-500">Variable Cost</td>
                                      {['A','B','C'].map(p => (
                                          <td key={p} className="text-center text-slate-500">${calculated.analysis[p].unitVarCost.toFixed(0)}</td>
                                      ))}
                                  </tr>
                                  <tr className="border-b border-amber-200 bg-amber-100/50">
                                      <td className="py-2 font-bold text-slate-700">Margin/Unit</td>
                                      {['A','B','C'].map(p => (
                                          <td key={p} className="text-center font-bold text-slate-800">${calculated.analysis[p].unitMargin.toFixed(2)}</td>
                                      ))}
                                  </tr>
                                  <tr>
                                      <td className="py-2 text-slate-600">$/Machine Hr</td>
                                      {['A','B','C'].map(p => {
                                          const val = calculated.analysis[p].marginPerMachine;
                                          const best = Math.max(calculated.analysis.A.marginPerMachine, calculated.analysis.B.marginPerMachine, calculated.analysis.C.marginPerMachine);
                                          return (
                                              <td key={p} className={`text-center ${val === best ? 'font-bold text-green-700 bg-green-100 rounded' : 'text-slate-500'}`}>
                                                  ${val.toFixed(2)}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
            )}
            
            {!showAnalysis && (
                <div className="bg-indigo-50 p-4 border-t border-indigo-100 flex justify-between items-center text-xs text-indigo-800">
                <span>Maximize Contribution Margin</span>
                <button onClick={() => setShowAnalysis(true)} className="font-bold hover:underline flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Show Strategy
                </button>
                </div>
            )}
          </Card>

          {/* 3. Investments & Finance */}
          <Card className="border-l-4 border-l-emerald-500">
             <CardHeader title="4. Growth & Financing" icon={Banknote} color="text-emerald-600" />
             <div className="p-6">
                
                <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Investments</div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Machine (CAPEX)" prefix="$" value={investments.machine} onChange={(v) => setInvestments({...investments, machine: v})} />
                        <InputGroup label="Labour (Training)" prefix="$" value={investments.labour} onChange={(v) => setInvestments({...investments, labour: v})} />
                    </div>

                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-4 border-t border-slate-100">Financing (Est. Rates: ST {rates.st}%, LT {rates.lt}%)</div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Request S.T. Loan" prefix="$" value={financing.newST} onChange={(v) => setFinancing({...financing, newST: v})} />
                        <InputGroup label="Issue L.T. Debt" prefix="$" value={financing.newLT} onChange={(v) => setFinancing({...financing, newLT: v})} />
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-4">
                        <InputGroup label="Dividends to Pay ($)" prefix="$" value={dividends} onChange={(v) => setDividends(v)} />
                    </div>
                </div>
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Dashboard & Feedback */}
        <div className="lg:col-span-8 space-y-6">

          {/* Top Level KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Proj. ROE" 
              value={`${calculated.financials.roe.toFixed(1)}%`} 
              highlight 
              subtext="Win Metric (NI / Equity)"
            />
            <MetricCard 
              label="Proj. Net Income" 
              value={`$${calculated.financials.netIncome.toLocaleString()}`} 
              trend="up"
              alert={calculated.financials.netIncome < 0}
            />
             <MetricCard 
              label="End Cash" 
              value={`$${calculated.financials.cashEnd.toLocaleString()}`} 
              alert={calculated.financials.cashEnd < 0}
            />
            <MetricCard 
              label="End Equity" 
              value={`$${calculated.financials.totalEquity.toLocaleString()}`} 
              subtext="Accumulated Wealth"
            />
          </div>

          {/* Resource Feasibility Visualizer */}
          <Card>
             <CardHeader title="Operational & Cash Constraints" icon={Activity} />
             <div className="p-6">
                <ProgressBar label="Machine Hours" current={calculated.usage.machine} max={operationalLimits.machineHrs} unit="hrs" />
                <ProgressBar label="Labour Hours" current={calculated.usage.labour} max={operationalLimits.labourHrs} unit="hrs" />
                <ProgressBar label="Materials" current={calculated.usage.material} max={operationalLimits.materialUnits} unit="units" />
                <ProgressBar 
                    label="Cash (Inflow from Debt - Outflow)" 
                    current={calculated.cashFlow.required} 
                    max={calculated.cashFlow.available} 
                    unit="$" 
                />
             </div>
          </Card>

          {/* Financial Statements Tabs */}
          <Card className="min-h-[500px]">
            <div className="border-b border-slate-200">
              <nav className="flex -mb-px">
                {[{ id: 'income', label: 'Income Statement' }, { id: 'balance', label: 'Balance Sheet' }].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'income' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-sm text-slate-500 italic mb-4">
                    <span>*Pro-Forma (Assuming 100% Sales)</span>
                  </div>
                  
                  {/* Revenue Section */}
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-medium text-slate-600">Revenue</span>
                    <span className="font-bold text-slate-800">${calculated.financials.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-sm text-slate-500 pl-4">- Cost of Goods Sold</span>
                    <span className="text-sm text-red-600">(${calculated.financials.cogs.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 bg-slate-50 px-2 -mx-2">
                    <span className="font-bold text-slate-700">Gross Profit</span>
                    <span className="font-bold text-slate-800">${calculated.financials.grossProfit.toLocaleString()}</span>
                  </div>

                  {/* Expenses Section */}
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-sm text-slate-500 pl-4">- Depreciation (Linear 5%)</span>
                    <span className="text-sm text-red-600">(${calculated.financials.depreciation.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-sm text-slate-500 pl-4">- Training (Labour Inv.)</span>
                    <span className="text-sm text-red-600">(${calculated.financials.training.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 bg-slate-50 px-2 -mx-2">
                    <span className="font-bold text-slate-700">EBIT</span>
                    <span className="font-bold text-slate-800">${(calculated.financials.grossProfit - calculated.financials.depreciation - calculated.financials.training).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-sm text-slate-500 pl-4">- Interest Paid</span>
                    <span className="text-sm text-red-600">(${calculated.financials.interest.toLocaleString()})</span>
                  </div>

                  {/* Net Income */}
                  <div className="flex justify-between py-4 mt-2 text-lg border-t-2 border-indigo-100">
                    <span className="font-bold text-indigo-900">Net Income</span>
                    <span className={`font-bold border-b-4 border-double ${calculated.financials.netIncome >= 0 ? 'text-indigo-600 border-indigo-600' : 'text-red-600 border-red-600'}`}>
                      ${calculated.financials.netIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'balance' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                   <div className="flex justify-between items-center text-sm text-slate-500 italic mb-2">
                    <span>*Projected Ending Position</span>
                  </div>

                  {/* ASSETS */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-200 pb-1">Assets</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Cash</span>
                            <span className={`font-bold ${calculated.financials.cashEnd < 0 ? 'text-red-600' : 'text-slate-800'}`}>${calculated.financials.cashEnd.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Inventory</span>
                            <span className="font-bold text-slate-800">${calculated.financials.inventoryEnd.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Fixed Assets (Net)</span>
                            <span className="font-bold text-slate-800">${calculated.financials.fixedAssetsNet.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-300 mt-2 font-bold text-slate-900">
                            <span>Total Assets</span>
                            <span>${calculated.financials.totalAssets.toLocaleString()}</span>
                        </div>
                    </div>
                  </div>

                  {/* LIABILITIES & EQUITY */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-200 pb-1">Liabilities & Equity</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Short Term Debt</span>
                            <span className="text-slate-800">${calculated.financials.totalShortTermDebt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Long Term Debt</span>
                            <span className="text-slate-800">${calculated.financials.totalLongTermDebt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 mt-2 border-t border-slate-100">
                            <span className="text-slate-600">Capital Stock</span>
                            <span className="text-slate-800">${initialBalance.equity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Retained Earnings</span>
                            <span className={`font-bold ${calculated.financials.endingRetainedEarnings < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                ${calculated.financials.endingRetainedEarnings.toLocaleString()}
                            </span>
                        </div>
                         <div className="flex justify-between pt-2 border-t border-slate-300 mt-2 font-bold text-slate-900">
                            <span>Total Liab. & Equity</span>
                            <div className="flex flex-col items-end">
                                <span>${(calculated.financials.totalLiabilities + calculated.financials.totalEquity).toLocaleString()}</span>
                                {Math.abs(calculated.financials.totalAssets - (calculated.financials.totalLiabilities + calculated.financials.totalEquity)) > 1 && (
                                    <span className="text-[10px] text-red-500 font-normal">Unbalanced! Check Cash</span>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* SUBMISSION TICKET */}
          <div className="mt-8">
            <button 
              onClick={() => setShowSubmission(!showSubmission)}
              disabled={!calculated.feasibility.all}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                ${calculated.feasibility.all ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}
              `}
            >
              <ClipboardList className="w-5 h-5" />
              {showSubmission ? "Hide Submission Ticket" : "Generate Plan for Submission"}
            </button>
            
            {showSubmission && (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-slate-800 rounded-xl p-6 text-slate-200 font-mono text-sm relative">
                    <div className="absolute top-4 right-4 text-xs text-slate-500 uppercase tracking-widest font-sans">
                      Submission Ticket
                    </div>
                    
                    {/* ADDED FIRM ID INPUT HERE */}
                    <div className="mb-6">
                      <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Firm Name / ID</label>
                      <input 
                        type="text" 
                        value={firmId} 
                        onChange={(e) => setFirmId(e.target.value)} 
                        className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-full font-sans focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Group 4"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 max-w-lg">
                       <div className="text-slate-400">Product A:</div>
                       <div className="text-white font-bold">{production.A} units @ ${prices.A}</div>
                       
                       <div className="text-slate-400">Product B:</div>
                       <div className="text-white font-bold">{production.B} units @ ${prices.B}</div>
                       
                       <div className="text-slate-400">Product C:</div>
                       <div className="text-white font-bold">{production.C} units @ ${prices.C}</div>
                       
                       <div className="col-span-2 border-t border-slate-700 my-2"></div>
                       
                       <div className="text-emerald-400">Inv. Machine:</div>
                       <div className="text-white font-bold">${investments.machine}</div>
                       
                       <div className="text-emerald-400">Inv. Labour:</div>
                       <div className="text-white font-bold">${investments.labour}</div>
                       
                       <div className="text-amber-400">New ST Debt:</div>
                       <div className="text-white font-bold">${financing.newST}</div>
                       
                       <div className="text-amber-400">New LT Debt:</div>
                       <div className="text-white font-bold">${financing.newLT}</div>
                       
                       <div className="text-indigo-400">Dividends:</div>
                       <div className="text-white font-bold">${dividends}</div>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-sans mt-4">
                      Copy these values exactly into the Google Form provided by your instructor.
                    </p>
                 </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}