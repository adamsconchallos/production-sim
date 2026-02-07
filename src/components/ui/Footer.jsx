import React, { useState } from 'react';
import LegalModal from './LegalModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [modal, setModal] = useState({ open: false, type: 'terms' });

  const openLegal = (type) => setModal({ open: true, type });

  return (
    <footer className="max-w-7xl mx-auto mt-12 pb-8 px-4 text-slate-400 border-t border-slate-700 pt-8 bg-[#1a365d] rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">About MutandisLab</h4>
          <p className="text-sm leading-relaxed">
            MutandisLab is a comprehensive business strategy simulation designed for students and professionals.
            It provides a hands-on environment to practice production planning, financial management,
            and competitive market analysis in a dynamic economic setting.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="text-sm space-y-2">
            <li>
              <button
                onClick={() => openLegal('terms')}
                className="hover:text-[#4fd1c5] transition-colors"
              >
                Terms and Conditions
              </button>
            </li>
            <li>
              <button
                onClick={() => openLegal('privacy')}
                className="hover:text-[#4fd1c5] transition-colors"
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>
        <div className="md:text-right">
          <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Contact & Support</h4>
          <p className="text-sm mb-4">
            For academic inquiries or technical support, please contact your instructor or the system administrator.
          </p>
          <div className="text-xs font-medium text-slate-300">
            &copy; {currentYear} Adams Ceballos. All rights reserved.
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-slate-700 text-[10px] text-center uppercase tracking-[0.2em] font-bold text-[#4fd1c5]">
        Strategy at Altitude
      </div>

      <LegalModal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        type={modal.type}
      />
    </footer>
  );
};

export default Footer;
