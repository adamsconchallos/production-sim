import { AlertTriangle } from 'lucide-react';

const InputCell = ({ value, onChange, prefix = "", suffix = "", className = "", warning = null, readOnly = false }) => (
  <div className={`relative flex items-center h-full w-full ${className}`}>
    {prefix && (
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <span className="text-slate-400 text-[10px]">{prefix}</span>
      </div>
    )}
    <input
      type="number"
      className={`block w-full h-full bg-transparent ${prefix ? 'pl-5' : 'pl-2'} ${suffix ? 'pr-6' : 'pr-1'} border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm text-right appearance-none ${warning ? 'text-amber-600 font-bold' : ''} ${readOnly ? 'text-slate-500 bg-slate-50 cursor-default' : ''}`}
      value={value}
      onChange={(e) => !readOnly && onChange(parseFloat(e.target.value) || 0)}
      readOnly={readOnly}
    />
    {suffix && (
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
        <span className="text-slate-400 text-[10px]">{suffix}</span>
      </div>
    )}
    {warning && (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
      </div>
    )}
  </div>
);

export default InputCell;
