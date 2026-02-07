import React from 'react';
import { Lightbulb, Factory, Users } from 'lucide-react';
import InputCell from '../ui/InputCell';
import Tooltip from '../ui/Tooltip';
import { formatVal } from '../../utils/formatters';

export default function OperationsTab({ decisions, simulation, lastState, updateVal, gameData }) {
  const isCleared = gameData?.round_status === 'cleared';
  // Helpers
  const products = ['A', 'B', 'C'];
  const getSimVal = (path) => path.split('.').reduce((o, i) => o?.[i], simulation);

  return (
    <div className="space-y-6">
      {/* HEADER / STRATEGY HINT */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Operational Strategy</h4>
          <p className="text-xs text-amber-700 mt-1">
            Maximize your Contribution Margin per Bottleneck Hour. Ensure your production mix doesn't exceed 
            Machine or Labour capacities. Unsold inventory carries carrying costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCT INPUTS */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Factory className="w-4 h-4" /> Production & Sales
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-right">Produce (Qty)</th>
                <th className="p-3 text-right">Price ($)</th>
                <th className="p-3 text-right">Sell (Qty)</th>
                <th className="p-3 text-right text-slate-400">Inventory</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const inv = lastState?.inventory_details?.[p]?.units || 0;
                const produce = decisions.qty[p] || 0;
                const maxSell = produce + inv;
                return (
                  <tr key={p} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-3 font-bold text-indigo-900">Product {p}</td>
                    <td className="p-3">
                      <InputCell
                        value={decisions.qty[p]}
                        onChange={(v) => updateVal(`qty.${p}`, v)}
                        disabled={isCleared}
                      />
                    </td>
                    <td className="p-3">
                      <InputCell
                        value={decisions.price[p]}
                        onChange={(v) => updateVal(`price.${p}`, v)}
                        prefix="$"
                        disabled={isCleared}
                      />
                    </td>
                    <td className="p-3">
                      <InputCell
                        value={decisions.sales[p]}
                        onChange={(v) => updateVal(`sales.${p}`, v)}
                        max={maxSell} // UI hint, not hard enforcement here
                        disabled={isCleared}
                      />
                      <div className="text-[10px] text-slate-400 text-right mt-1">
                        Max: {maxSell}
                      </div>
                    </td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      {inv} units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CAPACITY USAGE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4" /> Capacity Check
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Machine */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Machine Hours</span>
                <span className="text-slate-400">Limit: {simulation.limits.machine}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    simulation.capacityCheck.machine.isOver ? 'bg-red-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (simulation.capacityCheck.machine.used / simulation.limits.machine) * 100)}%` }}
                />
              </div>
              <div className={`text-right text-xs mt-1 font-bold ${
                simulation.capacityCheck.machine.isOver ? 'text-red-600' : 'text-indigo-600'
              }`}>
                {simulation.capacityCheck.machine.used} / {simulation.limits.machine} hrs 
                ({((simulation.capacityCheck.machine.used / simulation.limits.machine) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Labour */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Labour Hours</span>
                <span className="text-slate-400">Limit: {simulation.limits.labour}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    simulation.capacityCheck.labour.isOver ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (simulation.capacityCheck.labour.used / simulation.limits.labour) * 100)}%` }}
                />
              </div>
              <div className={`text-right text-xs mt-1 font-bold ${
                simulation.capacityCheck.labour.isOver ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {simulation.capacityCheck.labour.used} / {simulation.limits.labour} hrs 
                ({((simulation.capacityCheck.labour.used / simulation.limits.labour) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
