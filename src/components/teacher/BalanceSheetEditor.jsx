import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

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
      <h3 className="font-bold text-slate-700 mb-4">Initial Balance Sheet</h3>

      {disabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          Balance sheet can only be edited before Round 1 opens.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Assets</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center">
              <span>Cash</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.cash ?? ''} onChange={e => setField('cash', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>Machines</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.fixedAssets ?? ''} onChange={e => setField('fixedAssets', e.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Liabilities</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center">
              <span>ST Debt</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.stDebt ?? ''} onChange={e => setField('stDebt', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>LT Debt</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.ltDebt ?? ''} onChange={e => setField('ltDebt', e.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Equity</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center">
              <span>Capital</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.equity ?? ''} onChange={e => setField('equity', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>Ret. Earn</span>
              <input type="number" className={inputClass} readOnly={disabled} value={setup.retainedEarnings ?? ''} onChange={e => setField('retainedEarnings', e.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Rates & Limits</span>
          <div className="mt-2 space-y-1">
            <label className="flex justify-between items-center">
              <span>ST Rate %</span>
              <input type="number" className={rateInputClass} readOnly={disabled} value={rates.st ?? ''} onChange={e => setRate('st', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>LT Rate %</span>
              <input type="number" className={rateInputClass} readOnly={disabled} value={rates.lt ?? ''} onChange={e => setRate('lt', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>Tax Rate %</span>
              <input type="number" className={rateInputClass} readOnly={disabled} value={rates.tax ?? ''} onChange={e => setRate('tax', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>Mach Hrs</span>
              <input type="number" className={rateInputClass} readOnly={disabled} value={setup.limits?.machine ?? ''} onChange={e => setLimit('machine', e.target.value)} />
            </label>
            <label className="flex justify-between items-center">
              <span>Lab Hrs</span>
              <input type="number" className={rateInputClass} readOnly={disabled} value={setup.limits?.labour ?? ''} onChange={e => setLimit('labour', e.target.value)} />
            </label>
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

      {!disabled && (
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Balance Sheet'}
          </button>
          {firmCount > 0 && (
            <span className="text-xs text-slate-500">Saving will also update the initial state for {firmCount} firm{firmCount !== 1 ? 's' : ''}.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceSheetEditor;
