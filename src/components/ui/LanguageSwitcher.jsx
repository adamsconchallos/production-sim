import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
      <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
          lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('es')}
        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
          lang === 'es' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSwitcher;
