import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, CheckCircle, XCircle, AlertCircle, Play, Wand2, Info } from 'lucide-react';
import { calculateCreditRating } from '../../utils/creditRating';
import { calculateLoanPayment } from '../../utils/finance';

export default function LoanReviewPanel({ gameId, currentRound, firms, onPublish }) {
  const [requests, setRequests] = useState([]);
  const [firmStats, setFirmStats] = useState({}); // firmId -> { rating, estimatedST, estimatedLT, ... }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [globalRates, setGlobalRates] = useState({ st: 10, lt: 5 });

  useEffect(() => {
    fetchData();
  }, [gameId, currentRound]);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Fetch Global Rates
        const { data: gameData } = await supabase.from('games').select('rates').eq('id', gameId).single();
        if (gameData?.rates) {
            setGlobalRates(gameData.rates);
        }

        // 2. Fetch Loan Requests
        const { data: requestData, error } = await supabase
            .from('loan_requests')
            .select('*')
            .eq('game_id', gameId)
            .eq('round', currentRound)
            .order('firm_id');
        
        if (error) throw error;
        setRequests(requestData || []);

        // 3. Fetch Previous Round States (for Risk Calc)
        const prevRound = currentRound - 1;
        if (prevRound >= 0) {
            const { data: states } = await supabase
                .from('firm_state')
                .select('firm_id, state')
                .eq('game_id', gameId)
                .eq('round', prevRound);
            
            const stats = {};
            states?.forEach(s => {
                const rating = calculateCreditRating(s.state.financials || s.state, gameData.rates);
                stats[s.firm_id] = rating;
            });
            setFirmStats(stats);
        }

    } catch (err) {
        console.error("Error fetching data:", err);
        setMessage({ type: 'error', text: 'Failed to load loan requests.' });
    } finally {
        setLoading(false);
    }
  };

  const updateRequest = (id, field, value) => {
    setRequests(prev => prev.map(r => {
        if (r.id !== id) return r;
        return { ...r, [field]: value };
    }));
  };

  const smartSuggest = () => {
      setRequests(prev => prev.map(r => {
          // Find firm's rating
          const stat = firmStats[r.firm_id];
          const rate = r.loan_type === 'ST' 
             ? (stat ? stat.estimatedST : globalRates.st)
             : (stat ? stat.estimatedLT : globalRates.lt);
          
          return {
              ...r,
              status: 'approved',
              approved_amount: r.requested_amount,
              approved_rate: rate,
              approved_term: r.loan_type === 'ST' ? 1 : 10 
          };
      }));
      setMessage({ type: 'success', text: 'Applied suggested rates based on risk profiles.' });
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage(null);
    try {
        const { error } = await supabase
            .from('loan_requests')
            .upsert(requests);
        
        if (error) throw error;
        setMessage({ type: 'success', text: 'Loan decisions saved.' });
    } catch (err) {
        setMessage({ type: 'error', text: 'Failed to save: ' + err.message });
    } finally {
        setSaving(false);
    }
  };

  const getFirmName = (id) => firms.find(f => f.id === id)?.name || id.substring(0, 8);

  const getStatusColor = (status) => {
      switch(status) {
          case 'approved': return 'bg-emerald-100 text-emerald-800';
          case 'partial': return 'bg-amber-100 text-amber-800';
          case 'denied': return 'bg-red-100 text-red-800';
          default: return 'bg-slate-100 text-slate-800';
      }
  };

  if (loading) return <div className="p-4 text-center text-slate-500">Loading requests...</div>;

  if (requests.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <h3 className="font-bold text-slate-700 mb-2">Loan Review</h3>
            <p className="text-slate-500">No loan requests submitted for this round.</p>
            <button 
                onClick={onPublish}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-bold"
            >
                Skip & Publish Round
            </button>
        </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700">Loan Review (Round {currentRound})</h3>
        <div className="flex gap-2">
            <button 
                onClick={smartSuggest}
                className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded font-bold flex items-center gap-2 border border-indigo-200"
            >
                <Wand2 className="w-4 h-4" /> Smart Suggest
            </button>
            <button 
                onClick={saveChanges}
                disabled={saving}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-bold flex items-center gap-1"
            >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                    <th className="p-3">Firm / Risk</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Requested</th>
                    <th className="p-3">Approved Amount</th>
                    <th className="p-3">Rate (%)</th>
                    <th className="p-3">Term (Yrs)</th>
                    <th className="p-3">Annual Payment</th>
                    <th className="p-3">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {requests.map(r => {
                    const stat = firmStats[r.firm_id];
                    const cuota = calculateLoanPayment(r.approved_amount, r.approved_rate, r.approved_term);
                    return (
                    <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3">
                            <div className="font-medium">{getFirmName(r.firm_id)}</div>
                            {stat && (
                                <div className={`text-xs font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${stat.bgColor} ${stat.color}`}>
                                    {stat.rating}
                                </div>
                            )}
                        </td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${r.loan_type === 'ST' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {r.loan_type}
                            </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">${parseInt(r.requested_amount).toLocaleString()}</td>
                        <td className="p-3 w-32">
                            <input 
                                type="number" 
                                value={r.approved_amount}
                                onChange={(e) => updateRequest(r.id, 'approved_amount', parseFloat(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1"
                            />
                        </td>
                        <td className="p-3 w-24">
                            <input 
                                type="number" 
                                value={r.approved_rate}
                                onChange={(e) => updateRequest(r.id, 'approved_rate', parseFloat(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1"
                            />
                        </td>
                        <td className="p-3 w-20">
                            <input 
                                type="number" 
                                value={r.approved_term}
                                onChange={(e) => updateRequest(r.id, 'approved_term', parseInt(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1"
                            />
                        </td>
                        <td className="p-3">
                           <div className="font-mono font-bold text-indigo-600">
                               ${Math.round(cuota).toLocaleString()}
                           </div>
                           <div className="text-[10px] text-slate-400 italic">x {r.approved_term} yrs</div>
                        </td>
                        <td className="p-3">
                            <select 
                                value={r.status}
                                onChange={(e) => updateRequest(r.id, 'status', e.target.value)}
                                className={`px-2 py-1 rounded text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(r.status)}`}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="partial">Partial</option>
                                <option value="denied">Denied</option>
                            </select>
                        </td>
                    </tr>
                );})}
            </tbody>
        </table>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
          <button
            onClick={onPublish}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
              <Play className="w-4 h-4" /> Publish Loan Decisions
          </button>
      </div>
      <p className="text-right text-xs text-slate-400 mt-2">
          Publishing will update the round status to "Loans Reviewed" and allow students to see their status.
      </p>
    </div>
  );
}
