import React, { useState } from 'react';
import { Table, TrendingUp, DollarSign } from 'lucide-react';
import OperationsTab from './OperationsTab';
import InvestmentTab from './InvestmentTab';
import FinanceTab from './FinanceTab';

export default function PlannerTabs({ decisions, simulation, lastState, updateVal, gameData, history }) {
  const [activeTab, setActiveTab] = useState('ops');

  const tabs = [
    { id: 'ops', label: 'Operations', icon: <Table className="w-4 h-4" /> },
    { id: 'inv', label: 'Investment', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'fin', label: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* TABS HEADER */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="min-h-[500px]">
        {activeTab === 'ops' && (
          <OperationsTab 
            decisions={decisions} 
            simulation={simulation} 
            lastState={lastState} 
            updateVal={updateVal}
            gameData={gameData}
          />
        )}
        {activeTab === 'inv' && (
          <InvestmentTab 
            decisions={decisions} 
            simulation={simulation} 
            lastState={lastState} 
            updateVal={updateVal}
            gameData={gameData}
          />
        )}
        {activeTab === 'fin' && (
          <FinanceTab 
            decisions={decisions} 
            simulation={simulation} 
            lastState={lastState} 
            updateVal={updateVal}
            gameData={gameData}
          />
        )}
      </div>
    </div>
  );
}
