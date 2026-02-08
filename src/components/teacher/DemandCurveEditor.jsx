import { Save, AlertTriangle, TrendingUp, TrendingDown, Maximize2, Minimize2, Info } from 'lucide-react';

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

  const applyScenario = (type) => {
    const newParams = {};
    ['A', 'B', 'C'].forEach(p => {
      // Start with current param or fallback to default
      const base = params[p] || DEFAULT_PARAMS[p];
      newParams[p] = {
        intercept: base.intercept ?? DEFAULT_PARAMS[p].intercept,
        slope: base.slope ?? DEFAULT_PARAMS[p].slope,
        growth: base.growth ?? DEFAULT_PARAMS[p].growth
      };

      if (type === 'expansion') {
        newParams[p].intercept = parseFloat((newParams[p].intercept * 1.2).toFixed(2));
      } else if (type === 'contraction') {
        newParams[p].intercept = parseFloat((newParams[p].intercept * 0.8).toFixed(2));
      } else if (type === 'sensitive') {
        newParams[p].slope = parseFloat((newParams[p].slope * 1.5).toFixed(5));
      } else if (type === 'inelastic') {
        newParams[p].slope = parseFloat((newParams[p].slope * 0.5).toFixed(5));
      } else if (type === 'growth_high') {
        newParams[p].growth = 1.10;
      } else if (type === 'growth_none') {
        newParams[p].growth = 1.0;
      }
    });
    onParametersChange(newParams);
  };

  const hasValidationError = ['A', 'B', 'C'].some(p => {
    const d = params[p];
    return !d || d.intercept <= 0 || d.slope <= 0 || d.growth <= 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-700 mb-1">Demand Curve & Market Dynamics</h3>
          <p className="text-xs text-slate-500">
            Price = Intercept − (Slope × Total Market Quantity). Growth is applied each round.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="group relative">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Info className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="font-bold mb-1">How it works:</p>
              <ul className="space-y-1 list-disc ml-3">
                <li><strong>Intercept:</strong> Maximum price possible (at Q=0). Increase for "Expansion".</li>
                <li><strong>Slope:</strong> How much price drops as supply increases. Lower slope = flatter curve.</li>
                <li><strong>Growth:</strong> Multiplier applied to Intercept each round. 1.05 = 5% growth.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Presets */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Quick Scenarios (Apply to all products)</span>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <button onClick={() => applyScenario('expansion')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-emerald-500 hover:text-emerald-700 transition-all text-[11px] font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Expansion
          </button>
          <button onClick={() => applyScenario('contraction')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-red-500 hover:text-red-700 transition-all text-[11px] font-bold">
            <TrendingDown className="w-4 h-4 text-red-500" /> Contraction
          </button>
          <button onClick={() => applyScenario('sensitive')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-amber-500 hover:text-amber-700 transition-all text-[11px] font-bold">
            <Maximize2 className="w-4 h-4 text-amber-500" /> More Elastic
          </button>
          <button onClick={() => applyScenario('inelastic')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-indigo-500 hover:text-indigo-700 transition-all text-[11px] font-bold">
            <Minimize2 className="w-4 h-4 text-indigo-500" /> More Inelastic
          </button>
          <button onClick={() => applyScenario('growth_high')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-700 transition-all text-[11px] font-bold">
            <TrendingUp className="w-4 h-4 text-blue-500" /> 10% Growth
          </button>
          <button onClick={() => applyScenario('growth_none')} className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded hover:border-slate-400 transition-all text-[11px] font-bold">
            <Info className="w-4 h-4 text-slate-400" /> No Growth
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
            <th className="text-left p-2">Product</th>
            <th className="text-left p-2">
              <span className="flex items-center gap-1" title="Price when quantity is 0 (y-intercept)">Intercept ($) <Info className="w-3 h-3 text-slate-300"/></span>
            </th>
            <th className="text-left p-2">
              <span className="flex items-center gap-1" title="Price drop per unit of quantity">Slope <Info className="w-3 h-3 text-slate-300"/></span>
            </th>
            <th className="text-left p-2">
              <span className="flex items-center gap-1" title="Trend multiplier applied each round. 1.0 = stable, 1.05 = 5% growth">Growth <Info className="w-3 h-3 text-slate-300"/></span>
            </th>
            <th className="text-right p-2 text-slate-400">Price @ Q=5000</th>
            <th className="text-right p-2 text-slate-400">Price @ Q=10000</th>
          </tr>
        </thead>
        <tbody>
          {['A', 'B', 'C'].map(p => {
            const d = params[p] || DEFAULT_PARAMS[p];
            // Ensure we have numbers for display
            const intercept = d.intercept ?? DEFAULT_PARAMS[p].intercept;
            const slope = d.slope ?? DEFAULT_PARAMS[p].slope;
            const growth = d.growth ?? DEFAULT_PARAMS[p].growth;

            const priceAt5k = intercept - slope * 5000;
            const priceAt10k = intercept - slope * 10000;
            const invalid = intercept <= 0 || slope <= 0 || growth <= 0;
            return (
              <tr key={p} className={`border-b border-slate-100 ${invalid ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <td className="p-2 font-bold">Product {p}</td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-20 border rounded px-1"
                    value={intercept}
                    onChange={e => setParam(p, 'intercept', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.0001"
                    className="w-24 border rounded px-1"
                    value={slope}
                    onChange={e => setParam(p, 'slope', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 border rounded px-1"
                    value={growth}
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
