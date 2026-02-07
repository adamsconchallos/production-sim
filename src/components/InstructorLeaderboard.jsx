import React from 'react';
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react';

const InstructorLeaderboard = ({ leaderboard, loading, currentRound }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full mb-2"></div>
        <p className="text-slate-500 text-sm">Loading DuPont analysis...</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>No results available yet. Clear a round to see the DuPont analysis!</p>
      </div>
    );
  }

  const round = currentRound || Math.max(...leaderboard.map(r => r.round || 0));

  return (
    <div className="space-y-6">
      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold">DuPont Analysis Leaderboard</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            Financial performance breakdown — Round {round}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                <th className="px-4 py-4 text-left">Rank</th>
                <th className="px-4 py-4 text-left">Firm Name</th>
                <th className="px-4 py-4 text-right" title="Return on Equity">ROE</th>
                <th className="px-4 py-4 text-right" title="Net Income / Revenue">Profit Margin</th>
                <th className="px-4 py-4 text-right" title="Revenue / Total Assets">Asset Turnover</th>
                <th className="px-4 py-4 text-right" title="Total Assets / Equity">Equity Multiplier</th>
                <th className="px-4 py-4 text-right" title="Net Income / Total Assets">ROA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((firm, index) => {
                const isTop3 = index < 3;

                return (
                  <tr key={firm.id || index} className={`hover:bg-slate-50 transition-colors ${isTop3 ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-slate-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className={`font-bold ${isTop3 ? 'text-indigo-700' : 'text-slate-600'}`}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-900">{firm.name || 'Unknown Firm'}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${
                        (firm.roe || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {(firm.roe || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-medium ${
                        (firm.profitMargin || 0) >= 0 ? 'text-slate-700' : 'text-red-600'
                      }`}>
                        {(firm.profitMargin || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-slate-700">
                        {(firm.assetTurnover || 0).toFixed(2)}×
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-slate-700">
                        {(firm.equityMultiplier || 0).toFixed(2)}×
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-medium ${
                        (firm.roa || 0) >= 0 ? 'text-slate-700' : 'text-red-600'
                      }`}>
                        {(firm.roa || 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DuPont Formula Explainer */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h3 className="text-sm font-bold text-indigo-900 mb-3">DuPont Analysis Formula</h3>
        <div className="text-sm text-slate-700 space-y-2">
          <div className="font-mono bg-white/60 p-3 rounded-lg border border-indigo-100">
            <span className="font-bold text-indigo-700">ROE</span> =
            <span className="text-emerald-700"> Profit Margin</span> ×
            <span className="text-blue-700"> Asset Turnover</span> ×
            <span className="text-purple-700"> Equity Multiplier</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
            <div className="bg-white/60 p-2 rounded border border-indigo-100">
              <div className="font-bold text-emerald-700">Profit Margin</div>
              <div className="text-slate-600">Net Income / Revenue</div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-indigo-100">
              <div className="font-bold text-blue-700">Asset Turnover</div>
              <div className="text-slate-600">Revenue / Total Assets</div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-indigo-100">
              <div className="font-bold text-purple-700">Equity Multiplier</div>
              <div className="text-slate-600">Total Assets / Equity</div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-indigo-100">
              <div className="font-bold text-amber-700">ROA</div>
              <div className="text-slate-600">Net Income / Total Assets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Top ROE</div>
          <div className="text-lg font-bold text-slate-900">{leaderboard[0]?.name || 'N/A'}</div>
          <div className="text-indigo-600 font-bold">{(leaderboard[0]?.roe || 0).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg Profit Margin</div>
          <div className="text-lg font-bold text-slate-900">
            {leaderboard.length > 0
              ? (leaderboard.reduce((sum, f) => sum + (f.profitMargin || 0), 0) / leaderboard.length).toFixed(1)
              : '0.0'}%
          </div>
          <div className="text-slate-400 text-xs">Market Average</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg Asset Turnover</div>
          <div className="text-lg font-bold text-slate-900">
            {leaderboard.length > 0
              ? (leaderboard.reduce((sum, f) => sum + (f.assetTurnover || 0), 0) / leaderboard.length).toFixed(2)
              : '0.00'}×
          </div>
          <div className="text-slate-400 text-xs">Market Average</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg ROA</div>
          <div className="text-lg font-bold text-slate-900">
            {leaderboard.length > 0
              ? (leaderboard.reduce((sum, f) => sum + (f.roa || 0), 0) / leaderboard.length).toFixed(1)
              : '0.0'}%
          </div>
          <div className="text-slate-400 text-xs">Market Average</div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLeaderboard;
