import { HelpCircle } from 'lucide-react';

const Tooltip = ({ text, width = "w-64" }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <HelpCircle className="w-3 h-3 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
    <div className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute left-full top-1/2 -translate-y-1/2 ml-2 ${width} bg-slate-800 text-white text-[11px] leading-tight rounded p-2 z-50 shadow-xl pointer-events-none`}>
      {text}
      <div className="absolute left-0 top-1/2 -translate-x-[4px] -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-800"></div>
    </div>
  </div>
);

export default Tooltip;
