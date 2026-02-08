import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import InputCell from '../ui/InputCell';
import Tooltip from '../ui/Tooltip';
import { calculateCreditRating } from '../../utils/creditRating';

const LoanStatusCard = ({ request }) => {
  if (!request) return null; 

  const { status, approved_amount, approved_rate, approved_term, requested_amount } = request;
  
  let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
  let icon = <Clock className="w-4 h-4" />;
  let label = "Pending Review";

  if (status === 'approved') {
    colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = <CheckCircle className="w-4 h-4" />;
    label = "Approved";
  } else if (status === 'partial') {
    colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    icon = <AlertCircle className="w-4 h-4" />;
    label = "Partially Approved";
  } else if (status === 'denied') {
    colorClass = "bg-red-50 text-red-700 border-red-200";
    icon = <XCircle className="w-4 h-4" />;
    label = "Denied";
  }

  return (
    <div className={`mt-2 p-3 rounded-lg border text-xs flex flex-col gap-1 ${colorClass}`}>
      <div className="flex items-center gap-2 font-bold uppercase">
        {icon} {label}
      </div>
      {status !== 'denied' && status !== 'pending' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
          <div>Amount: <span className="font-mono font-bold">${parseInt(approved_amount).toLocaleString()}</span></div>
          <div>Rate: <span className="font-mono font-bold">{approved_rate}%</span></div>
          {approved_term && <div>Term: <span className="font-mono font-bold">{approved_term} Yrs</span></div>}
        </div>
      )}
      {status === 'denied' && (
        <div>Requested: ${parseInt(requested_amount).toLocaleString()}</div>
      )}
    </div>
  );
};

export default function InvestmentTab({ decisions, simulation, lastState, updateVal, gameData, isGameMode, loanRequests }) {
  const isCleared = gameData?.round_status === 'cleared';
  const showApproval = isGameMode && (gameData?.round_status === 'loans_reviewed' || gameData?.round_status === 'cleared');

  // Calculate Credit Rating
  const creditProfile = useMemo(() => {
    const baseRates = gameData?.rates || { st: 10, lt: 5 };
    // Use lastState (beginning of round) for rating but include new decisions
    const financials = lastState?.financials || lastState || {}; 
    const projected = {
      ...financials,
      stDebt: (financials.stDebt || 0) + Number(decisions.finance.newST || 0),
      ltDebt: (financials.ltDebt || 0) + Number(decisions.finance.newLT || 0),
    };
    return calculateCreditRating(projected, baseRates);
  }, [lastState, gameData, decisions.finance.newST, decisions.finance.newLT]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-800">Growth & Investment</h4>
          <p className="text-xs text-indigo-700 mt-1">
            Invest in new capacity to meet future demand. Raise debt to finance these investments.
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
          
          {/* CREDIT PROFILE CARD */}
          <div className={`mx-6 mt-6 p-4 rounded-lg border ${creditProfile.bgColor}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-lg font-bold ${creditProfile.color} flex items-center gap-2`}>
                   {creditProfile.rating === 'AAA' || creditProfile.rating === 'A' ? <ShieldCheck className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5"/>}
                   Rating: {creditProfile.rating}
                </div>
                <div className={`text-xs font-bold uppercase mt-1 ${creditProfile.color}`}>{creditProfile.label}</div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-slate-500 uppercase">Est. Rate</div>
                 <div className="font-mono font-bold text-slate-700">{creditProfile.estimatedST.toFixed(1)}% - {creditProfile.estimatedLT.toFixed(1)}%</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600">
               Your D/E ratio is <strong>{creditProfile.metrics.debtToEquity.toFixed(2)}</strong>. 
               {creditProfile.score < 80 
                 ? " Reduce debt or increase equity to improve your rating and lower rates." 
                 : " You have strong creditworthiness."}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">New Short-Term Debt</div>
                <div className="text-xs text-slate-400">
                  {isGameMode 
                    ? `Likely Rate: ~${creditProfile.estimatedST.toFixed(1)}%` 
                    : "Rate: 10% | Due: 1 Year"}
                </div>
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
            {showApproval && <LoanStatusCard request={loanRequests?.ST} type="ST" />}

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-slate-700">New Long-Term Debt</div>
                <div className="text-xs text-slate-400">
                   {isGameMode 
                    ? `Likely Rate: ~${creditProfile.estimatedLT.toFixed(1)}%` 
                    : "Rate: 5% | Due: 10 Years"}
                </div>
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
            {showApproval && <LoanStatusCard request={loanRequests?.LT} type="LT" />}

             <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                Warning: Taking on too much debt increases bankruptcy risk if demand falls.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
