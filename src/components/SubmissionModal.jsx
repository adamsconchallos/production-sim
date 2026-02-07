import { useState, useMemo } from 'react';
import { ClipboardList, X, Copy, ExternalLink, Upload, Check } from 'lucide-react';
import { getGridRows } from '../constants/gridRows';

const SubmissionModal = ({ firmId, setFirmId, decisions, simulation, showSubmission, setShowSubmission, session, gameData }) => {
  const gridRows = getGridRows();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isGameMode = !!session;

  const ticketData = useMemo(() => {
    const id = isGameMode ? session.firmName : firmId;
    if (!id) return "Please enter a Firm ID above first.";

    let txt = "";
    let currentGroup = "";

    gridRows.forEach(row => {
      if (row.type === 'header') {
        currentGroup = row.label;
      } else if (row.type !== 'spacer') {
        let val = '';
        if (row.type === 'input') {
          const [cat, field] = row.id.split('.');
          val = decisions[cat][field];
        } else if (row.type === 'displayLimit') {
          val = simulation.limits[row.id];
        } else if (row.type === 'status') {
          const status = simulation.capacityCheck[row.id];
          val = status.limit > 0 ? (status.used / status.limit) : 0;
        } else if (row.type === 'output') {
          val = simulation.financials[row.id];
        }
        txt += `${id}\t${currentGroup}\t${row.label}\t${val}\n`;
      }
    });
    return txt;
  }, [firmId, session, gridRows, decisions, simulation, isGameMode]);

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketData);
  };

  const submitToGame = async () => {
    if (!session || !gameData) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('decisions')
        .upsert({
          game_id: session.gameId,
          firm_id: session.firmId,
          round: gameData.current_round,
          data: decisions,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'game_id,firm_id,round'
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!showSubmission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5"/>
            {isGameMode ? `Round ${gameData?.current_round} Submission` : 'Submission Ticket'}
          </h3>
          <button onClick={() => setShowSubmission(false)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">

          {/* GAME MODE: Submit to Database */}
          {isGameMode && (
            <div className="mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                <div className="text-sm font-bold text-indigo-900 mb-1">
                  Submitting as: {session.firmName}
                </div>
                <div className="text-xs text-indigo-700">
                  Round {gameData?.current_round} &middot; {gameData?.round_status === 'open' ? 'Submissions Open' : 'Submissions Closed'}
                </div>
              </div>

              {gameData?.round_status !== 'open' ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-lg">
                  Submissions are currently closed for this round.
                </div>
              ) : submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg flex items-center gap-3">
                  <Check className="w-6 h-6" />
                  <div>
                    <div className="font-bold">Decisions Submitted</div>
                    <div className="text-sm">You can re-submit to update your decisions while the round is open.</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={submitToGame}
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Decisions'}
                </button>
              )}

              {submitError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {submitError}
                </div>
              )}

              {submitted && gameData?.round_status === 'open' && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold"
                >
                  Update Submission
                </button>
              )}
            </div>
          )}

          {/* DEMO MODE: Firm ID + Copy Ticket */}
          {!isGameMode && (
            <>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Firm ID</label>
                <input
                  type="text"
                  value={firmId ?? ''}
                  onChange={(e) => setFirmId(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:border-indigo-500 outline-none"
                  placeholder="Enter Group Name..."
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">1. Copy Data</span>
                  <button onClick={copyTicket} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold">
                    <Copy className="w-3 h-3" /> Copy to Clipboard
                  </button>
                </div>
                <textarea
                  readOnly
                  value={ticketData}
                  className="w-full h-64 font-mono text-xs p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={(e) => e.target.select()}
                />
                <p className="text-center text-xs text-slate-400 mt-2">
                  Format: Firm ID | Group | Item | Value <br/>
                  Click text to select all, then Ctrl+C to copy.
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-900 uppercase block">2. Submit Data</span>
                  <p className="text-xs text-indigo-700">Paste the copied data into the official form.</p>
                </div>
                <a
                  href="https://forms.gle/t39WQg3pWq1ko8wP9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  Go to Google Form <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
