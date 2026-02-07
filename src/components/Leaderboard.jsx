import React from 'react';
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react';

const Leaderboard = ({ leaderboard, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full mb-2"></div>
        <p className="text-slate-500 text-sm">Loading leaderboard...</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>No results available yet. Complete a round to see the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold">Market Leaderboard</h2>
          </div>
          <p className="text-indigo-100 text-sm">Ranked by Return on Equity (ROE) — Round {leaderboard.length > 0 ? Math.max(...leaderboard.map(r => r.round || 0)) : 0}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Firm Name</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-right">Net Income</th>
                <th className="px-6 py-4 text-right">ROE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((firm, index) => {
                const isTop3 = index < 3;
                const trend = (firm.prevRoe !== null && firm.prevRoe !== undefined) ? (firm.roe || 0) - firm.prevRoe : 0;

                return (
                  <tr key={firm.id || index} className={`hover:bg-slate-50 transition-colors ${isTop3 ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-slate-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className={`font-bold ${isTop3 ? 'text-indigo-700' : 'text-slate-600'}`}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{firm.name || 'Unknown Firm'}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      ${(firm.revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      ${(firm.netIncome || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {firm.prevRoe !== null && firm.prevRoe !== undefined && (
                          <span title={`Previous: ${firm.prevRoe.toFixed(1)}%`}>
                            {trend > 0.1 ? (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            ) : trend < -0.1 ? (
                              <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                            ) : (
                              <div className="w-3 h-0.5 bg-slate-300 rounded-full" />
                            )}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${
                          (firm.roe || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {(firm.roe || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Top Performer</div>
          <div className="text-lg font-bold text-slate-900">{leaderboard[0]?.name || 'N/A'}</div>
          <div className="text-indigo-600 font-bold">{(leaderboard[0]?.roe || 0).toFixed(1)}% ROE</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Average ROE</div>
          <div className="text-lg font-bold text-slate-900">
            {(leaderboard.reduce((sum, f) => sum + (f.roe || 0), 0) / leaderboard.length).toFixed(1)}%
          </div>
          <div className="text-slate-400 text-xs">Market Average</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Market Activity</div>
          <div className="text-lg font-bold text-slate-900">
            ${leaderboard.reduce((sum, f) => sum + (f.revenue || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-slate-400 text-xs">Total Market Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
