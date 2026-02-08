import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import FanChart from './charts/FanChart';
import Card from './ui/Card';

const MarketBrief = ({ scenarios, onRefresh, loading, usingDefaults }) => {
  const [activeTab, setActiveTab] = useState("A");
  const data = scenarios[activeTab];

  return (
    <div className="space-y-6">
      {/* Product Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-1">
        <div className="flex space-x-2">
            {Object.keys(scenarios).map(key => (
            <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${activeTab === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
                {scenarios[key].name}
            </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
            {usingDefaults && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Using Default Data
                </span>
            )}
            <button
                onClick={onRefresh}
                className={`flex items-center gap-1 text-xs transition-colors mr-2 px-3 py-1 rounded border ${loading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-wait' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                title="Fetch latest market data"
                disabled={loading}
            >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Loading..." : "Refresh Data"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FanChart title="Price Forecast ($)" data={data} type="price" color="#0ea5e9" />
        <FanChart title="Total Market Demand (Units)" data={data} type="demand" color="#8b5cf6" />
      </div>

      <Card className="p-0">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Forecast Summary Table</h3>
          <span className="text-xs text-slate-400 italic">Confidence Level: 95% (2SD)</span>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">Metric</th>
              <th className="p-4">Current ({data.history[data.history.length-1].year})</th>
              <th className="p-4 bg-indigo-50 text-indigo-700">Forecast Mean ({data.forecast.year})</th>
              <th className="p-4">Low Case (-2SD)</th>
              <th className="p-4">High Case (+2SD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4 font-bold text-slate-700">Market Price</td>
              <td className="p-4">${(data.history[data.history.length-1]?.price || 0).toFixed(2)}</td>
              <td className="p-4 bg-indigo-50 font-bold text-indigo-700">${(data.forecast?.price?.mean || 0).toFixed(2)}</td>
              <td className="p-4 text-red-600">${((data.forecast?.price?.mean || 0) - (2 * (data.forecast?.price?.sd || 0))).toFixed(2)}</td>
              <td className="p-4 text-emerald-600">${((data.forecast?.price?.mean || 0) + (2 * (data.forecast?.price?.sd || 0))).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-700">Total Demand</td>
              <td className="p-4">{(data.history[data.history.length-1]?.demand || 0).toLocaleString()}</td>
              <td className="p-4 bg-indigo-50 font-bold text-indigo-700">{(data.forecast?.demand?.mean || 0).toLocaleString()}</td>
              <td className="p-4 text-slate-500">{((data.forecast?.demand?.mean || 0) - (2 * (data.forecast?.demand?.sd || 0))).toLocaleString()}</td>
              <td className="p-4 text-slate-500">{((data.forecast?.demand?.mean || 0) + (2 * (data.forecast?.demand?.sd || 0))).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 bg-amber-50 text-amber-800 text-xs border-t border-amber-100">
          <strong>Strategic Hint:</strong> The "Forecast Mean" assumes the industry supply grows at a historical average rate.
          If you believe competitors will oversupply (aggressive expansion), expect prices to trend toward the <strong>Low Case</strong>.
          If supply is constrained, prices may hit the <strong>High Case</strong>.
        </div>
      </Card>
    </div>
  );
};

export default MarketBrief;
