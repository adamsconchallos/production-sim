import React, { useMemo } from 'react';
import { DollarSign, PieChart, AlertTriangle } from 'lucide-react';
import InputCell from '../ui/InputCell';
import { formatVal } from '../../utils/formatters';

export default function FinanceTab({ decisions, simulation, lastState, updateVal, gameData }) {
  const isCleared = gameData?.round_status === 'cleared';
  
  const Row = ({ label, current, projected, format = 'currency', highlight = false, negative = false, isHeader = false }) => {
    if (isHeader) {
        return (
            <div className="grid grid-cols-3 gap-4 py-2 border-b-2 border-slate-200 font-bold text-xs uppercase text-slate-500">
                <div>{label}</div>
                <div className="text-right">Current (Act)</div>
                <div className={`text-right ${isCleared ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {isCleared ? 'Actual Result' : 'Projected'}
                </div>
            </div>
        );
    }
    const isProjNeg = (negative && projected > 0) || projected < 0;
    
    return (
      <div className={`grid grid-cols-3 gap-4 py-2 border-b border-slate-100 text-sm ${highlight ? 'font-bold bg-slate-50' : ''}`}>
        <div className="text-slate-700 pl-2">{label}</div>
        <div className="text-right text-slate-500">
            {formatVal(current, format)}
        </div>
        <div className={`text-right ${isProjNeg ? 'text-red-600' : isCleared ? 'text-emerald-700' : 'text-indigo-700'}`}>
            {negative && projected > 0 ? `(${formatVal(projected, format)})` : formatVal(projected, format)}
        </div>
      </div>
    );
  };

  const lastFin = useMemo(() => lastState?.financials || lastState || {}, [lastState]);
  const projFin = simulation?.financials || {};

  return (
    <div className="space-y-6">
      
      {/* CASH MANAGEMENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Cash Management
        </h3>

        {projFin.cash < 0 && (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Projected Cash Deficit: {formatVal(projFin.cash, 'currency')}</div>
              <div className="text-red-600 mt-0.5">
                Your company is projected to run out of cash. This will trigger <span className="font-bold">FORCED LIQUIDATION</span> of inventory (30% loss) and fixed assets (50% loss) to cover the gap.
              </div>
            </div>
          </div>
        )}

        {projFin.mandatoryPayment > 0 && (
          <div className="flex items-start gap-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm mb-6">
            <DollarSign className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Mandatory Debt Service: {formatVal(projFin.mandatoryPayment, 'currency')}</div>
              <div className="text-blue-600 mt-0.5">
                You have active loans requiring a fixed annual payment. This is automatically deducted from your cash.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Repay ST Debt</label>
                <InputCell 
                    value={decisions.finance.payST}
                    onChange={(v) => updateVal('finance.payST', v)}
                    prefix="$"
                    disabled={isCleared}
                />
                <div className="text-[10px] text-slate-400 mt-1">Curr: {formatVal(lastFin.stDebt, 'currency')}</div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Repay LT Debt</label>
                <InputCell 
                    value={decisions.finance.payLT}
                    onChange={(v) => updateVal('finance.payLT', v)}
                    prefix="$"
                    disabled={isCleared}
                />
                <div className="text-[10px] text-slate-400 mt-1">Curr: {formatVal(lastFin.ltDebt, 'currency')}</div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pay Dividends</label>
                <InputCell 
                    value={decisions.finance.div}
                    onChange={(v) => updateVal('finance.div', v)}
                    prefix="$"
                    disabled={isCleared}
                />
                <div className="text-[10px] text-slate-400 mt-1">Ret Earn: {formatVal(lastFin.retainedEarnings, 'currency')}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INCOME STATEMENT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">Income Statement</h3>
             </div>
             <div className="p-6">
                <Row label="Metric" isHeader />
                <Row label="Revenue" current={lastFin.revenue} projected={projFin.revenue} />
                <Row label="COGS (Var)" current={lastFin.varCost} projected={projFin.varCost} negative />
                <Row label="Gross Profit" current={lastFin.grossProfit} projected={projFin.grossProfit} highlight />
                
                <Row label="Depreciation" current={lastFin.depreciation} projected={projFin.depreciation} negative />
                <Row label="Training" current={lastFin.trainingExp} projected={projFin.trainingExp} negative />
                <Row label="EBIT" current={lastFin.ebit} projected={projFin.ebit} />
                <Row label="Interest" current={lastFin.interest} projected={projFin.interest} negative />
                <Row label="Taxes" current={lastFin.tax} projected={projFin.tax} negative />
                
                <Row label="Net Income" current={lastFin.netIncome} projected={projFin.netIncome} highlight />

                <div className="h-4 border-t border-slate-100 my-2"></div>
                <Row label="Liquidation Loss" current={lastFin.liquidationLoss} projected={projFin.liquidationLoss} negative />
                <Row label="EVA (Score)" current={lastFin.eva} projected={projFin.eva} highlight />
             </div>
        </div>

        {/* BALANCE SHEET */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">Balance Sheet</h3>
             </div>
             <div className="p-6">
                <Row label="Item" isHeader />
                <Row label="Cash" current={lastFin.cash} projected={projFin.cash} />
                <Row label="Inventory" current={lastFin.inventory} projected={projFin.inventory} />
                <div className="pl-6 space-y-0.5 mb-2">
                    <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <div className="pl-2">Prod A Units</div>
                        <div className="text-right">{lastFin.inventoryUnitsA || 0}</div>
                        <div className="text-right text-indigo-600">{projFin.inventoryUnitsA || 0}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <div className="pl-2">Prod B Units</div>
                        <div className="text-right">{lastFin.inventoryUnitsB || 0}</div>
                        <div className="text-right text-indigo-600">{projFin.inventoryUnitsB || 0}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <div className="pl-2">Prod C Units</div>
                        <div className="text-right">{lastFin.inventoryUnitsC || 0}</div>
                        <div className="text-right text-indigo-600">{projFin.inventoryUnitsC || 0}</div>
                    </div>
                </div>
                <Row label="Fixed Assets" current={lastFin.fixedAssets} projected={projFin.fixedAssets} />
                <Row label="Total Assets" current={lastFin.totalAssets} projected={projFin.totalAssets} highlight />
                
                <div className="h-4"></div>

                <Row label="ST Debt" current={lastFin.stDebt} projected={projFin.stDebt} />
                <Row label="LT Debt" current={lastFin.ltDebt} projected={projFin.ltDebt} />
                <Row label="Equity (Cap)" current={lastFin.equity} projected={projFin.equity} />
                <Row label="Retained Earn" current={lastFin.retainedEarnings} projected={projFin.retainedEarnings} />
                <Row label="Liab & Equity" current={lastFin.totalLiabEquity} projected={projFin.totalLiabEquity} highlight />
             </div>
        </div>
      </div>
    </div>
  );
}
