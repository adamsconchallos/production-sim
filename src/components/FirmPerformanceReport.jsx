import { useMemo } from 'react';
import { formatVal } from '../utils/formatters';
import { calculateCreditRating } from '../utils/creditRating';

const f = (v, fmt = 'currency') => formatVal(v, fmt);

function FRow({ label, prev, curr, format = 'currency', bold }) {
  return (
    <tr className={bold ? 'font-bold border-t border-slate-400' : 'border-b border-slate-100'}>
      <td className="py-1 pr-4">{label}</td>
      <td className="py-1 text-right tabular-nums">{f(prev, format)}</td>
      <td className="py-1 text-right tabular-nums">{f(curr, format)}</td>
    </tr>
  );
}

export default function FirmPerformanceReport({ firmName, roundNumber, roundStatus, decisions, simulation, lastState, rates }) {
  const prevFin = useMemo(() => lastState?.financials || lastState?.state?.financials || lastState?.state || {}, [lastState]);
  const currFin = useMemo(() => simulation?.financials || {}, [simulation]);
  const baseRates = useMemo(() => rates || { st: 10, lt: 5 }, [rates]);
  const credit = useMemo(() => calculateCreditRating(currFin, baseRates), [currFin, baseRates]);

  const machUtil = simulation?.capacityCheck?.machine;
  const labUtil = simulation?.capacityCheck?.labour;
  const machPct = machUtil ? Math.round((machUtil.used / machUtil.limit) * 100) : 0;
  const labPct = labUtil ? Math.round((labUtil.used / labUtil.limit) * 100) : 0;

  const isCleared = roundStatus === 'cleared';
  const statusLabel = isCleared ? 'Actual Result' : 'Projected';

  return (
    <div className="print-only font-sans text-slate-900 text-[11px] leading-snug max-w-[210mm]">

      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Firm Performance Report</h1>
          <div className="text-base font-semibold text-slate-600">{firmName}</div>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <div>Round {roundNumber} &mdash; {isCleared ? 'Cleared' : 'Open'}</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* DECISION SUMMARY */}
      <div className="border border-slate-300 rounded p-3 mb-4" style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Decision Summary &mdash; Round {roundNumber}</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Production */}
          <div>
            <h3 className="font-semibold mb-1">Production &amp; Pricing</h3>
            <table className="w-full">
              <thead><tr className="text-[9px] text-slate-400 uppercase">
                <th className="text-left">Prod</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Sell</th>
              </tr></thead>
              <tbody>
                {['A', 'B', 'C'].map(p => (
                  <tr key={p} className="border-b border-slate-100">
                    <td>{p}</td>
                    <td className="text-right tabular-nums">{decisions?.qty?.[p] || 0}</td>
                    <td className="text-right tabular-nums">{f(decisions?.price?.[p], 'currency')}</td>
                    <td className="text-right tabular-nums">{decisions?.sales?.[p] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Investments */}
          <div>
            <h3 className="font-semibold mb-1">Investment</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-100"><td>Machine Inv</td><td className="text-right tabular-nums">{f(decisions?.inv?.machine)}</td></tr>
                <tr className="border-b border-slate-100"><td>Labour / Training</td><td className="text-right tabular-nums">{f(decisions?.inv?.labour)}</td></tr>
              </tbody>
            </table>
          </div>
          {/* Financing */}
          <div>
            <h3 className="font-semibold mb-1">Financing</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-100"><td>New ST Debt</td><td className="text-right tabular-nums">{f(decisions?.finance?.newST)}</td></tr>
                <tr className="border-b border-slate-100"><td>New LT Debt</td><td className="text-right tabular-nums">{f(decisions?.finance?.newLT)}</td></tr>
                <tr className="border-b border-slate-100"><td>Repay ST</td><td className="text-right tabular-nums">{f(decisions?.finance?.payST)}</td></tr>
                <tr className="border-b border-slate-100"><td>Repay LT</td><td className="text-right tabular-nums">{f(decisions?.finance?.payLT)}</td></tr>
                <tr className="border-b border-slate-100"><td>Dividends</td><td className="text-right tabular-nums">{f(decisions?.finance?.div)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* OPERATIONS & CAPACITY */}
      <div className="border border-slate-300 rounded p-3 mb-4" style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Operations &amp; Capacity</h2>
        <div className="grid grid-cols-2 gap-6">
          <table className="w-full">
            <thead><tr className="text-[9px] text-slate-400 uppercase border-b border-slate-300">
              <th className="text-left py-1">Product</th><th className="text-right py-1">Produced</th><th className="text-right py-1">Sold</th><th className="text-right py-1">Inv Remaining</th>
            </tr></thead>
            <tbody>
              {['A', 'B', 'C'].map(p => (
                <tr key={p} className="border-b border-slate-100">
                  <td className="py-1">{p}</td>
                  <td className="text-right tabular-nums py-1">{decisions?.qty?.[p] || 0}</td>
                  <td className="text-right tabular-nums py-1">{currFin?.[`inventoryUnits${p}`] !== undefined ? (decisions?.qty?.[p] || 0) + (simulation?.inventoryDetails?.[p]?.units || 0) - (currFin?.[`inventoryUnits${p}`] || 0) : decisions?.sales?.[p] || 0}</td>
                  <td className="text-right tabular-nums py-1">{currFin?.[`inventoryUnits${p}`] || 0}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="font-bold border-t border-slate-400">
              <td className="py-1">Total</td>
              <td className="text-right tabular-nums py-1">{(decisions?.qty?.A || 0) + (decisions?.qty?.B || 0) + (decisions?.qty?.C || 0)}</td>
              <td className="text-right tabular-nums py-1">{currFin?.totalUnitsSold || 0}</td>
              <td className="text-right tabular-nums py-1">{(currFin?.inventoryUnitsA || 0) + (currFin?.inventoryUnitsB || 0) + (currFin?.inventoryUnitsC || 0)}</td>
            </tr></tfoot>
          </table>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between"><span>Machine Utilization</span><span className="font-semibold">{machPct}%</span></div>
              <div className="w-full bg-slate-200 rounded h-2 mt-1">
                <div className={`h-2 rounded ${machPct > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(machPct, 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">{machUtil?.used || 0} / {machUtil?.limit || 0} hrs</div>
            </div>
            <div>
              <div className="flex justify-between"><span>Labour Utilization</span><span className="font-semibold">{labPct}%</span></div>
              <div className="w-full bg-slate-200 rounded h-2 mt-1">
                <div className={`h-2 rounded ${labPct > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(labPct, 100)}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">{labUtil?.used || 0} / {labUtil?.limit || 0} hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* INCOME STATEMENT + BALANCE SHEET side by side */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Income Statement */}
        <div className="border border-slate-300 rounded p-3" style={{ breakInside: 'avoid' }}>
          <h2 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Income Statement</h2>
          <table className="w-full">
            <thead><tr className="text-[9px] text-slate-400 uppercase border-b border-slate-300">
              <th className="text-left py-1"></th><th className="text-right py-1">Prev</th><th className="text-right py-1">{statusLabel}</th>
            </tr></thead>
            <tbody>
              <FRow label="Revenue" prev={prevFin.revenue} curr={currFin.revenue} />
              <FRow label="COGS (Variable)" prev={prevFin.varCost} curr={currFin.varCost} />
              <FRow label="Gross Profit" prev={prevFin.grossProfit} curr={currFin.grossProfit} bold />
              <FRow label="Depreciation" prev={prevFin.depreciation} curr={currFin.depreciation} />
              <FRow label="Training" prev={prevFin.trainingExp} curr={currFin.trainingExp} />
              <FRow label="EBIT" prev={prevFin.ebit} curr={currFin.ebit} bold />
              <FRow label="Interest" prev={prevFin.interest} curr={currFin.interest} />
              <FRow label="Taxes" prev={prevFin.tax} curr={currFin.tax} />
              <FRow label="Net Income" prev={prevFin.netIncome} curr={currFin.netIncome} bold />
              <FRow label="Liquidation Loss" prev={prevFin.liquidationLoss} curr={currFin.liquidationLoss} />
              <FRow label="EVA (Score)" prev={prevFin.eva} curr={currFin.eva} bold />
            </tbody>
          </table>
        </div>

        {/* Balance Sheet */}
        <div className="border border-slate-300 rounded p-3" style={{ breakInside: 'avoid' }}>
          <h2 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Balance Sheet</h2>
          <table className="w-full">
            <thead><tr className="text-[9px] text-slate-400 uppercase border-b border-slate-300">
              <th className="text-left py-1"></th><th className="text-right py-1">Prev</th><th className="text-right py-1">{statusLabel}</th>
            </tr></thead>
            <tbody>
              <FRow label="Cash" prev={prevFin.cash} curr={currFin.cash} />
              <FRow label="Inventory" prev={prevFin.inventory} curr={currFin.inventory} />
              <FRow label="Fixed Assets" prev={prevFin.fixedAssets} curr={currFin.fixedAssets} />
              <FRow label="Total Assets" prev={prevFin.totalAssets} curr={currFin.totalAssets} bold />
              <tr><td colSpan={3} className="py-1" /></tr>
              <FRow label="ST Debt" prev={prevFin.stDebt} curr={currFin.stDebt} />
              <FRow label="LT Debt" prev={prevFin.ltDebt} curr={currFin.ltDebt} />
              <FRow label="Equity (Capital)" prev={prevFin.equity} curr={currFin.equity} />
              <FRow label="Retained Earnings" prev={prevFin.retainedEarnings} curr={currFin.retainedEarnings} />
              <FRow label="Liab & Equity" prev={prevFin.totalLiabEquity} curr={currFin.totalLiabEquity} bold />
            </tbody>
          </table>
        </div>
      </div>

      {/* KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-5 gap-2 mb-4" style={{ breakInside: 'avoid' }}>
        {[
          { label: 'EVA', prev: prevFin.eva, curr: currFin.eva, fmt: 'currency' },
          { label: 'ROE', prev: prevFin.roe, curr: currFin.roe, fmt: 'percent' },
          { label: 'Credit Rating', text: `${credit.rating} (${credit.label})` },
          { label: 'D/E Ratio', prev: credit.metrics?.debtToEquity, curr: credit.metrics?.debtToEquity, fmt: 'decimal', currOnly: true },
          { label: 'Capacity', text: `M: ${machPct}% | L: ${labPct}%` },
        ].map((m, i) => (
          <div key={i} className="border border-slate-300 rounded p-2 text-center">
            <div className="text-[9px] uppercase text-slate-400 font-bold">{m.label}</div>
            {m.text ? (
              <div className="text-sm font-bold mt-1">{m.text}</div>
            ) : m.currOnly ? (
              <div className="text-sm font-bold mt-1">{f(m.curr, m.fmt)}</div>
            ) : (
              <>
                <div className="text-[9px] text-slate-400 mt-1">Prev: {f(m.prev, m.fmt)}</div>
                <div className="text-sm font-bold">{f(m.curr, m.fmt)}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* STRATEGIC REFLECTION */}
      <div className="border-t-2 border-slate-800 pt-3" style={{ breakInside: 'avoid' }}>
        <h2 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Strategic Reflection</h2>
        <div className="space-y-4">
          <div className="border-b border-slate-300 pb-4 text-[10px] text-slate-400 italic">What worked well this round?</div>
          <div className="border-b border-slate-300 pb-4 text-[10px] text-slate-400 italic">What would you change next round?</div>
          <div className="border-b border-slate-300 pb-4 text-[10px] text-slate-400 italic">Key risks or opportunities going forward?</div>
        </div>
      </div>

      <div className="text-center text-[8px] text-slate-300 mt-6">StratFi &mdash; Firm Performance Report</div>
    </div>
  );
}
