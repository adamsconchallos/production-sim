import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="max-w-7xl mx-auto mt-12 pb-8 px-4 text-slate-500 border-t border-slate-200 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">About StratFi</h4>
          <p className="text-sm leading-relaxed">
            StratFi is a comprehensive business strategy simulation designed for students and professionals. 
            It provides a hands-on environment to practice production planning, financial management, 
            and competitive market analysis in a dynamic economic setting.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="text-sm space-y-2">
            <li>
              <button className="hover:text-indigo-600 transition-colors">Terms and Conditions</button>
            </li>
            <li>
              <button className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
            </li>
          </ul>
        </div>
        <div className="md:text-right">
          <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Contact & Support</h4>
          <p className="text-sm mb-4">
            For academic inquiries or technical support, please contact your instructor or the system administrator.
          </p>
          <div className="text-xs font-medium">
            &copy; {currentYear} Adams Ceballos. All rights reserved.
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-center uppercase tracking-[0.2em] font-bold text-slate-400">
        Strategy at Altitude
      </div>
    </footer>
  );
};

export default Footer;
