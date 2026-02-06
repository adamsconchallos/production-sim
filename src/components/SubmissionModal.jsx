import { useMemo } from 'react';
import { ClipboardList, X, Copy, ExternalLink } from 'lucide-react';
import { getGridRows } from '../constants/gridRows';

const SubmissionModal = ({ firmId, setFirmId, decisions, simulation, showSubmission, setShowSubmission }) => {
  const gridRows = getGridRows();

  const ticketData = useMemo(() => {
    if (!firmId) return "Please enter a Firm ID above first.";

    let txt = "";
    let currentGroup = "";

    gridRows.forEach(row => {
      if (row.type === 'header') {
        currentGroup = row.label;
      } else if (row.type !== 'spacer') {
        // Determine value for Round 1
        let val = '';
        if (row.type === 'input') {
          const [cat, field] = row.id.split('.');
          val = decisions.r1[cat][field];
        } else if (row.type === 'displayLimit') {
          val = simulation.r1.limits[row.id];
        } else if (row.type === 'status') {
          const status = simulation.r1.capacityCheck[row.id];
          val = status.limit > 0 ? (status.used / status.limit) : 0; // Raw decimal
        } else if (row.type === 'output') {
          val = simulation.r1.financials[row.id];
        }

        // Format: FirmID | Group | Item | Value
        // Using raw numbers for easy excel pasting
        txt += `${firmId}\t${currentGroup}\t${row.label}\t${val}\n`;
      }
    });
    return txt;
  }, [firmId, gridRows, decisions, simulation]);

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketData);
    alert("Ticket copied to clipboard!");
  };

  if (!showSubmission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5"/> Submission Ticket</h3>
          <button onClick={() => setShowSubmission(false)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Firm ID</label>
            <input
              type="text"
              value={firmId}
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
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
