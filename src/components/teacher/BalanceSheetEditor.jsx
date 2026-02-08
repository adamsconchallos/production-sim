import { Save, AlertTriangle, CheckCircle, Info, Landmark, ShieldCheck } from 'lucide-react';

const BalanceSheetEditor = ({ setup, rates, onSetupChange, onRatesChange, onSave, saving, disabled, firmCount }) => {
  const totalAssets = (setup.cash || 0) + (setup.fixedAssets || 0);
  const totalLE = (setup.stDebt || 0) + (setup.ltDebt || 0) + (setup.equity || 0) + (setup.retainedEarnings || 0);
  const isBalanced = Math.abs(totalAssets - totalLE) < 0.01;

  const inputClass = disabled
    ? 'w-20 border rounded px-1 bg-slate-100 text-slate-400 cursor-not-allowed'
    : 'w-20 border rounded px-1';
  const rateInputClass = disabled
    ? 'w-16 border rounded px-1 bg-slate-100 text-slate-400 cursor-not-allowed'
    : 'w-16 border rounded px-1';

  const setField = (field, value) => onSetupChange({ ...setup, [field]: parseFloat(value) || 0 });
  const setRate = (field, value) => onRatesChange({ ...rates, [field]: parseFloat(value) || 0 });
  const setLimit = (field, value) => onSetupChange({ ...setup, limits: { ...setup.limits, [field]: parseFloat(value) || 0 } });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-700">Initial Balance Sheet</h3>
          <p className="text-xs text-slate-500">Every firm starts the simulation with this exact position.</p>
        </div>
        {disabled && (
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Locked (R1 Started)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Assets</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center" title="Starting liquid cash">
              <span className="flex items-center gap-1">Cash <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.cash ?? ''} onChange={e => setField('cash', e.target.value)} />
            </label>
            <label className="flex justify-between items-center" title="Initial value of machines (Fixed Assets)">
              <span className="flex items-center gap-1">Machines <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.fixedAssets ?? ''} onChange={e => setField('fixedAssets', e.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Liabilities</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center" title="Short-term debt (repayable next year)">
              <span className="flex items-center gap-1">ST Debt <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.stDebt ?? ''} onChange={e => setField('stDebt', e.target.value)} />
            </label>
            <label className="flex justify-between items-center" title="Long-term debt">
              <span className="flex items-center gap-1">LT Debt <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.ltDebt ?? ''} onChange={e => setField('ltDebt', e.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Equity</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center" title="Initial share capital">
              <span className="flex items-center gap-1">Capital <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.equity ?? ''} onChange={e => setField('equity', e.target.value)} />
            </label>
            <label className="flex justify-between items-center" title="Cumulative profits from prior years">
              <span className="flex items-center gap-1">Ret. Earn <Info className="w-3 h-3 text-slate-300"/></span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.retainedEarnings ?? ''} onChange={e => setField('retainedEarnings', e.target.value)} />
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1 mb-2">
            <Landmark className="w-3 h-3" /> Environment
          </span>
          <div className="space-y-1">
            <label className="flex justify-between items-center" title="Annual interest on short-term loans">
              <span>ST Rate %</span>
              <input type="number" className={rateInputClass} value={rates.st ?? ''} onChange={e => setRate('st', e.target.value)} />
            </label>
            <label className="flex justify-between items-center" title="Annual interest on long-term loans">
              <span>LT Rate %</span>
              <input type="number" className={rateInputClass} value={rates.lt ?? ''} onChange={e => setRate('lt', e.target.value)} />
            </label>
            <label className="flex justify-between items-center" title="Corporate income tax rate">
              <span>Tax Rate %</span>
              <input type="number" className={rateInputClass} value={rates.tax ?? ''} onChange={e => setRate('tax', e.target.value)} />
            </label>
            <div className="border-t border-slate-200 my-2 pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Production Capacity</div>
              <label className="flex justify-between items-center mb-1" title="Maximum units machines can process in a round">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1">Mach Hrs <Info className="w-3 h-3 text-slate-300"/></span>
                <input type="number" className={rateInputClass} value={setup.limits?.machine ?? ''} onChange={e => setLimit('machine', e.target.value)} />
              </label>
              <p className="text-[10px] text-slate-400 mb-2 italic">Limits total units produced. (e.g. 1000 = max 1000 total units)</p>
              
              <label className="flex justify-between items-center mb-1" title="Maximum labor hours available in a round">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1">Lab Hrs <Info className="w-3 h-3 text-slate-300"/></span>
                <input type="number" className={rateInputClass} value={setup.limits?.labour ?? ''} onChange={e => setLimit('labour', e.target.value)} />
              </label>
              <p className="text-[10px] text-slate-400 italic">Limits complexity. Product C uses more labor than A.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance check */}
      <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${isBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        {isBalanced
          ? <><CheckCircle className="w-4 h-4" /> Assets (${totalAssets.toLocaleString()}) = Liabilities + Equity (${totalLE.toLocaleString()}) — Balanced</>
          : <><AlertTriangle className="w-4 h-4" /> Assets (${totalAssets.toLocaleString()}) ≠ Liabilities + Equity (${totalLE.toLocaleString()}) — Difference: ${Math.abs(totalAssets - totalLE).toLocaleString()}</>
        }
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={saving || (!isBalanced && !disabled)}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {firmCount > 0 && !disabled && (
          <span className="text-xs text-slate-500">Updates the initial state for {firmCount} firm{firmCount !== 1 ? 's' : ''}.</span>
        )}
      </div>
    </div>
  );
};

export default BalanceSheetEditor;
