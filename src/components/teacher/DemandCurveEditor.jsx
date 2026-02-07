import { Save, AlertTriangle } from 'lucide-react';

const DEFAULT_PARAMS = {
  A: { intercept: 50, slope: 0.002, growth: 1.0 },
  B: { intercept: 60, slope: 0.003, growth: 1.0 },
  C: { intercept: 70, slope: 0.005, growth: 1.0 }
};

const DemandCurveEditor = ({ parameters, onParametersChange, onSave, saving, currentRound, roundStatus }) => {
  const params = parameters || DEFAULT_PARAMS;

  const setParam = (product, field, value) => {
    onParametersChange({
      ...params,
      [product]: { ...params[product], [field]: parseFloat(value) || 0 }
    });
  };

  const hasValidationError = ['A', 'B', 'C'].some(p => {
    const d = params[p];
    return !d || d.intercept <= 0 || d.slope <= 0 || d.growth <= 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-bold text-slate-700 mb-1">Demand Curve Parameters</h3>
      <p className="text-xs text-slate-500 mb-4">
        Demand function: Price = Intercept − Slope × Quantity. Changes take effect at the next market clearing.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
            <th className="text-left p-2">Product</th>
            <th className="text-left p-2" title="Price when quantity is 0 (y-intercept)">Intercept ($)</th>
            <th className="text-left p-2" title="Price drop per unit of quantity">Slope</th>
            <th className="text-left p-2" title="AR(1) trend multiplier: 1.0 = stable, 1.05 = 5% growth">Growth</th>
            <th className="text-right p-2 text-slate-400">Price @ Q=5000</th>
            <th className="text-right p-2 text-slate-400">Price @ Q=10000</th>
          </tr>
        </thead>
        <tbody>
          {['A', 'B', 'C'].map(p => {
            const d = params[p] || DEFAULT_PARAMS[p];
            const priceAt5k = d.intercept - d.slope * 5000;
            const priceAt10k = d.intercept - d.slope * 10000;
            const invalid = d.intercept <= 0 || d.slope <= 0 || d.growth <= 0;
            return (
              <tr key={p} className={`border-b border-slate-100 ${invalid ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <td className="p-2 font-bold">Product {p}</td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-20 border rounded px-1"
                    value={d.intercept ?? ''}
                    onChange={e => setParam(p, 'intercept', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.0001"
                    className="w-24 border rounded px-1"
                    value={d.slope ?? ''}
                    onChange={e => setParam(p, 'slope', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 border rounded px-1"
                    value={d.growth ?? ''}
                    onChange={e => setParam(p, 'growth', e.target.value)}
                  />
                </td>
                <td className="p-2 text-right font-mono text-slate-500">
                  ${priceAt5k.toFixed(2)}
                </td>
                <td className="p-2 text-right font-mono text-slate-500">
                  ${priceAt10k.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {hasValidationError && (
        <div className="mt-3 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Intercept, slope, and growth must all be greater than 0.
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={saving || hasValidationError}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Parameters'}
        </button>
        <span className="text-xs text-slate-500">
          Round {currentRound} ({roundStatus})
        </span>
      </div>
    </div>
  );
};

export default DemandCurveEditor;
