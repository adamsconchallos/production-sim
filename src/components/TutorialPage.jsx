import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Target, BookOpen, Table, ArrowRight, Lightbulb, ListChecks, X, Globe } from 'lucide-react';

// Section Components
const OverviewSection = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.overview.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.overview.subtitle')}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">{t('tutorial.overview.objective_title')}</h2>
        <p className="text-blue-800">{t('tutorial.overview.objective_text')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('tutorial.overview.competition_title')}</h3>
          <p className="text-slate-700">{t('tutorial.overview.competition_text')}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">{t('tutorial.overview.winning_title')}</h3>
          <p className="text-amber-800">{t('tutorial.overview.winning_text')}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('tutorial.overview.rounds_title')}</h3>
        <p className="text-slate-700">{t('tutorial.overview.rounds_text')}</p>
      </div>
    </div>
  );
};

const ConceptsSection = () => {
  const { t } = useTranslation();

  const concepts = [
    { key: 'revenue', color: 'green' },
    { key: 'cogs', color: 'red' },
    { key: 'gross_profit', color: 'blue' },
    { key: 'ebit', color: 'purple' },
    { key: 'net_income', color: 'indigo' },
    { key: 'roe', color: 'amber' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      amber: 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300'
    };
    return colors[color] || 'bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.concepts.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.concepts.intro')}</p>
      </div>

      {concepts.map(({ key, color }) => (
        <div key={key} className={`border rounded-lg p-6 shadow-sm ${getColorClasses(color)}`}>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900">{t(`tutorial.concepts.${key}_term`)}</h3>
            <span className="text-sm text-slate-600 italic">{t(`tutorial.concepts.${key}_spanish`)}</span>
          </div>
          <p className="text-slate-800 mb-3 font-medium">{t(`tutorial.concepts.${key}_def`)}</p>
          <div className="bg-white/60 rounded px-3 py-2 mb-2 border border-black/5 inline-block">
            <p className="text-sm font-mono text-slate-700">{t(`tutorial.concepts.${key}_formula`)}</p>
          </div>
          <p className="text-sm text-slate-600 italic mt-2">{t(`tutorial.concepts.${key}_example`)}</p>
          {key === 'roe' && (
            <p className="text-sm text-amber-800 font-bold mt-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> {t('tutorial.concepts.roe_importance')}
            </p>
          )}
        </div>
      ))}

      <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-3">{t('tutorial.concepts.balance_sheet_title')}</h3>
        <div className="bg-white rounded px-4 py-3 mb-3 border border-slate-200 text-center">
          <p className="text-lg font-mono text-slate-900 font-bold">{t('tutorial.concepts.balance_sheet_equation')}</p>
        </div>
        <ul className="space-y-2 text-slate-700 ml-4 list-disc marker:text-slate-400">
          <li>{t('tutorial.concepts.balance_sheet_assets')}</li>
          <li>{t('tutorial.concepts.balance_sheet_liabilities')}</li>
          <li>{t('tutorial.concepts.balance_sheet_equity')}</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-300 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-green-900 mb-3">{t('tutorial.concepts.cash_title')}</h3>
        <p className="text-green-800 font-semibold mb-3">{t('tutorial.concepts.cash_importance')}</p>
        <div className="space-y-2 text-green-900">
          <p>✅ {t('tutorial.concepts.cash_sources')}</p>
          <p>❌ {t('tutorial.concepts.cash_uses')}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded px-4 py-3 mt-3">
          <p className="text-yellow-900 font-bold flex items-center gap-2">
            ⚠️ {t('tutorial.concepts.cash_warning')}
          </p>
        </div>
      </div>
    </div>
  );
};

const GridGuideSection = () => {
  const { t } = useTranslation();

  const sections = [
    { key: 'operations', icon: '📊', color: 'green' },
    { key: 'capacity', icon: '⚙️', color: 'slate' },
    { key: 'growth', icon: '📈', color: 'blue' },
    { key: 'finance', icon: '💳', color: 'yellow' },
    { key: 'income_statement', icon: '📋', color: 'indigo' },
    { key: 'balance_sheet', icon: '🏦', color: 'slate' }
  ];

  const getColorClasses = (color) => {
     const map = {
         green: 'bg-green-50 border-green-200',
         slate: 'bg-slate-50 border-slate-200',
         blue: 'bg-blue-50 border-blue-200',
         yellow: 'bg-yellow-50 border-yellow-200',
         indigo: 'bg-indigo-50 border-indigo-200'
     };
     return map[color] || map.slate;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.grid_guide.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.grid_guide.intro')}</p>
      </div>

      <div className="grid gap-4">
        {sections.map(({ key, icon, color }) => (
            <div key={key} className={`${getColorClasses(color)} border rounded-lg p-5 shadow-sm`}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                {t(`tutorial.grid_guide.${key}_title`)}
            </h3>
            <p className="text-slate-700 mb-3">{t(`tutorial.grid_guide.${key}_desc`)}</p>
            {t(`tutorial.grid_guide.${key}_tip`) !== `tutorial.grid_guide.${key}_tip` && (
                <div className="bg-white/60 rounded px-3 py-2 border border-black/5">
                <p className="text-sm text-slate-600">💡 {t(`tutorial.grid_guide.${key}_tip`)}</p>
                </div>
            )}
            {t(`tutorial.grid_guide.${key}_warning`) !== `tutorial.grid_guide.${key}_warning` && (
                <div className="bg-red-50 border border-red-200 rounded px-3 py-2 mt-2">
                <p className="text-sm text-red-800 font-medium">⚠️ {t(`tutorial.grid_guide.${key}_warning`)}</p>
                </div>
            )}
            </div>
        ))}
      </div>

      <div className="bg-slate-100 border border-slate-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Understanding Cell Types</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
            <div className="w-6 h-6 bg-white border border-slate-300 rounded shadow-inner"></div>
            <p className="text-slate-700 font-medium">{t('tutorial.grid_guide.input_vs_output')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
            <div className="w-6 h-6 bg-slate-100 border border-slate-300 rounded"></div>
            <p className="text-slate-700 font-medium">{t('tutorial.grid_guide.output_cells')}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4 italic text-center">{t('tutorial.grid_guide.tooltips')}</p>
      </div>
    </div>
  );
};

const RoundFlowSection = () => {
  const { t } = useTranslation();

  const steps = [
    { num: 1, key: 'step1', color: 'blue' },
    { num: 2, key: 'step2', color: 'purple' },
    { num: 3, key: 'step3', color: 'green' },
    { num: 4, key: 'step4', color: 'amber' },
    { num: 5, key: 'step5', color: 'orange' },
    { num: 6, key: 'step6', color: 'red' },
    { num: 7, key: 'step7', color: 'indigo' },
    { num: 8, key: 'step8', color: 'emerald' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.flow.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.flow.intro')}</p>
      </div>

      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
        {steps.map(({ num, key, color }) => (
          <div key={key} className="flex gap-4 relative">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white border-4 border-${color}-500 flex items-center justify-center z-10 shadow-sm`}>
              <span className={`text-${color}-700 font-bold`}>{num}</span>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 mb-1">{t(`tutorial.flow.${key}_title`)}</h3>
              <p className="text-slate-700 text-sm mb-2">{t(`tutorial.flow.${key}_desc`)}</p>
              
              {t(`tutorial.flow.${key}_tip`) !== `tutorial.flow.${key}_tip` && (
                <p className="text-xs text-slate-600 italic bg-slate-50 rounded px-2 py-1 inline-block">
                  💡 {t(`tutorial.flow.${key}_tip`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_warning`) !== `tutorial.flow.${key}_warning` && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1 mt-1 inline-block">
                  ⚠️ {t(`tutorial.flow.${key}_warning`)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <p className="text-indigo-900 mb-2 font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5"/> {t('tutorial.flow.resubmission')}
        </p>
        <p className="text-indigo-800 text-sm">{t('tutorial.flow.timing')}</p>
      </div>
    </div>
  );
};

const TipsSection = () => {
  const { t } = useTranslation();

  const tips = [
    { key: 'cash_warning', icon: '🚨', color: 'red' },
    { key: 'capacity', icon: '⚙️', color: 'blue' },
    { key: 'contribution_margin', icon: '💡', color: 'amber' },
    { key: 'debt', icon: '📊', color: 'purple' },
    { key: 'competitors', icon: '👀', color: 'indigo' },
    { key: 'growth', icon: '🌱', color: 'green' },
    { key: 'pricing', icon: '💵', color: 'emerald' },
    { key: 'fifo', icon: '📦', color: 'orange' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.tips.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.tips.intro')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tips.map(({ key, icon, color }) => (
            <div key={key} className={`bg-white border-l-4 border-${color}-500 shadow-sm rounded-r-lg p-6`}>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>{icon}</span>
                {t(`tutorial.tips.${key}_title`)}
            </h3>
            <p className="text-slate-700 text-sm mb-3">{t(`tutorial.tips.${key}_desc`)}</p>

            <div className="space-y-2 text-xs">
                {['solution', 'prevention', 'too_low', 'too_high', 'sweet_spot', 'good', 'danger', 'leverage', 'leaderboard', 'market', 'strategy', 'tradeoff', 'timing', 'roe_impact', 'higher', 'lower', 'optimal', 'impact'].map(suffix => {
                    const text = t(`tutorial.tips.${key}_${suffix}`);
                    if (text !== `tutorial.tips.${key}_${suffix}`) {
                        return <p key={suffix} className="bg-slate-50 p-1.5 rounded text-slate-600">{text}</p>
                    }
                    return null;
                })}
            </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const GlossarySection = () => {
  const { t } = useTranslation();
  // We need to access the array structure. 
  // Since t() returns string or path, we might need direct access or structure support in LanguageContext.
  // Assuming LanguageContext t() returns the object if path points to one.
  const terms = t('tutorial.glossary.terms'); 
  // Safe check if it returned the key string instead of array
  const termsList = Array.isArray(terms) ? terms : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.glossary.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.glossary.intro')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">English Term</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Spanish</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Definition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {termsList.map((term, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{term.english}</td>
                <td className="px-6 py-4 text-sm text-indigo-600 font-medium italic">{term.spanish}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{term.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-medium flex items-center justify-center gap-2">
            <Globe className="w-5 h-5" />
            {t('tutorial.glossary.footer')}
        </p>
      </div>
    </div>
  );
};

// Main Tutorial Page Component
const TutorialPage = ({ onClose }) => {
  const { t, lang, setLang } = useTranslation();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', icon: Target, label: t('tutorial.nav.overview') },
    { id: 'concepts', icon: BookOpen, label: t('tutorial.nav.concepts') },
    { id: 'grid', icon: Table, label: t('tutorial.nav.grid') },
    { id: 'flow', icon: ArrowRight, label: t('tutorial.nav.flow') },
    { id: 'tips', icon: Lightbulb, label: t('tutorial.nav.tips') },
    { id: 'glossary', icon: ListChecks, label: t('tutorial.nav.glossary') }
  ];

  return (
    <div className="flex h-full bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-full">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900">Tutorial</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition"
            title={t('tutorial.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
            {/* Language Toggle */}
            <button
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="w-full mb-6 px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 flex items-center justify-center gap-2 transition shadow-sm"
            >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            </button>

            {/* Section Navigation */}
            <nav className="space-y-1">
                {sections.map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                    activeSection === id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                    <Icon className={`w-4 h-4 ${activeSection === id ? 'text-indigo-300' : 'text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                </button>
                ))}
            </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            StratFi Tutorial v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-4xl mx-auto p-8">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'concepts' && <ConceptsSection />}
          {activeSection === 'grid' && <GridGuideSection />}
          {activeSection === 'flow' && <RoundFlowSection />}
          {activeSection === 'tips' && <TipsSection />}
          {activeSection === 'glossary' && <GlossarySection />}
        </div>
      </main>
    </div>
  );
};

export default TutorialPage;
