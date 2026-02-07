import React from 'react';
import { X } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Terms and Conditions",
      sections: [
        {
          h: "1. Acceptance of Terms",
          p: "By accessing StratFi, you agree to be bound by these terms. This simulation is provided 'as is' for educational and training purposes only."
        },
        {
          h: "2. Intellectual Property",
          p: "The simulation engine, mathematical models, and user interface are the intellectual property of Adams Ceballos. Users may not reverse engineer or redistribute the software without express permission."
        },
        {
          h: "3. Simulated Data",
          p: "All financial figures, market trends, and company results are purely simulated. They do not represent real-world market conditions and should not be used as the basis for actual financial decisions or investments."
        },
        {
          h: "4. User Conduct",
          p: "Users are expected to maintain academic integrity. Any attempt to manipulate the database or exploit system vulnerabilities is strictly prohibited."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          h: "1. Data Collection",
          p: "We collect minimal data necessary for the simulation: Instructor emails for authentication, and Firm Names/PINs for students to access their game sessions."
        },
        {
          h: "2. Data Usage",
          p: "Your data is used solely to maintain game state, calculate leaderboard rankings, and allow instructors to manage their simulations. We do not use your data for advertising."
        },
        {
          h: "3. Data Sharing",
          p: "Information provided by students is visible to their respective instructors. We do not share your personal information with third parties except as required by law."
        },
        {
          h: "4. Storage & Cookies",
          p: "We use browser Local Storage to keep you logged in during your session. No tracking cookies or third-party analytics are used in this application."
        }
      ]
    }
  };

  const data = content[type] || content.terms;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{data.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {data.sections.map((s, i) => (
            <div key={i}>
              <h3 className="font-bold text-slate-900 mb-2">{s.h}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.p}</p>
            </div>
          ))}
          <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase font-bold text-center">
            Last Updated: February 2026
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
