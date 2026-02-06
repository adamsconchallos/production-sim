import { Settings, AlertTriangle } from 'lucide-react';
import Card from './ui/Card';

const SetupPanel = ({ setup, setSetup, showSetup, setShowSetup }) => {
  if (!showSetup) return null;

  return (
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
  );
};

export default SetupPanel;
