import { useMemo } from 'react';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import Tooltip from './ui/Tooltip';
import InputCell from './ui/InputCell';
import { formatVal } from '../utils/formatters';

const PlannerGrid = ({ decisions, simulation, updateVal, collapsed, toggleSection }) => {
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

  return (
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
                );
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
  );
};

export default PlannerGrid;
