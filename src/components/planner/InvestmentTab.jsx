import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import InputCell from '../ui/InputCell';
import Tooltip from '../ui/Tooltip';
import { formatVal } from '../../utils/formatters';

export default function InvestmentTab({ decisions, simulation, lastState, updateVal, gameData }) {
  const isCleared = gameData?.round_status === 'cleared';
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-800">Growth & Investment</h4>
          <p className="text-xs text-indigo-700 mt-1">
            Invest in new capacity to meet future demand. Raise debt to finance these investments.
            Beware of interest costs and debt limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ASSET INVESTMENT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Capacity Expansion</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">Machine Investment</div>
                <div className="text-xs text-slate-400">Current Cap: {simulation.limits.machine} hrs</div>
              </div>
              <div className="w-32">
                <InputCell 
                  value={decisions.inv.machine}
                  onChange={(v) => updateVal('inv.machine', v)}
                  prefix="$"
                  disabled={isCleared}
                />
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
              Impact: +{(decisions.inv.machine / 1000 * 50).toFixed(0)} hours capacity next round.
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">Labour Training</div>
                <div className="text-xs text-slate-400">Current Cap: {simulation.limits.labour} hrs</div>
              </div>
              <div className="w-32">
                <InputCell 
                  value={decisions.inv.labour}
                  onChange={(v) => updateVal('inv.labour', v)}
                  prefix="$"
                  disabled={isCleared}
                />
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
              Impact: Increases labour hours immediately (Training Expense).
            </div>
          </div>
        </div>

        {/* FINANCING */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">New Financing</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">New Short-Term Debt</div>
                <div className="text-xs text-slate-400">Rate: 10% | Due: 1 Year</div>
              </div>
              <div className="w-32">
                <InputCell 
                  value={decisions.finance.newST}
                  onChange={(v) => updateVal('finance.newST', v)}
                  prefix="$"
                  disabled={isCleared}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">New Long-Term Debt</div>
                <div className="text-xs text-slate-400">Rate: 5% | Due: 10 Years</div>
              </div>
              <div className="w-32">
                <InputCell 
                  value={decisions.finance.newLT}
                  onChange={(v) => updateVal('finance.newLT', v)}
                  prefix="$"
                  disabled={isCleared}
                />
              </div>
            </div>

             <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                Warning: Taking on too much debt increases bankruptcy risk if demand falls.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
