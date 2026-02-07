import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Target, BookOpen, Table, ArrowRight, Lightbulb, ListChecks, X, Globe } from 'lucide-react';

// Section Components
const OverviewSection = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.overview.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.overview.subtitle')}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">{t('tutorial.overview.objective_title')}</h2>
        <p className="text-blue-800">{t('tutorial.overview.objective_text')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('tutorial.overview.competition_title')}</h3>
          <p className="text-slate-700">{t('tutorial.overview.competition_text')}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">{t('tutorial.overview.winning_title')}</h3>
          <p className="text-amber-800">{t('tutorial.overview.winning_text')}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.concepts.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.concepts.intro')}</p>
      </div>

      {concepts.map(({ key, color }) => (
        <div key={key} className={`border rounded-lg p-6 ${getColorClasses(color)}`}>
          <div className="flex items-baseline gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900">{t(`tutorial.concepts.${key}_term`)}</h3>
            <span className="text-sm text-slate-600 italic">{t(`tutorial.concepts.${key}_spanish`)}</span>
          </div>
          <p className="text-slate-800 mb-3">{t(`tutorial.concepts.${key}_def`)}</p>
          <div className="bg-white/50 rounded px-3 py-2 mb-2">
            <p className="text-sm font-mono text-slate-700">{t(`tutorial.concepts.${key}_formula`)}</p>
          </div>
          <p className="text-sm text-slate-600 italic">{t(`tutorial.concepts.${key}_example`)}</p>
          {key === 'roe' && (
            <p className="text-sm text-amber-800 font-semibold mt-2">{t('tutorial.concepts.roe_importance')}</p>
          )}
        </div>
      ))}

      <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-3">{t('tutorial.concepts.balance_sheet_title')}</h3>
        <div className="bg-white rounded px-4 py-3 mb-3">
          <p className="text-lg font-mono text-center text-slate-900">{t('tutorial.concepts.balance_sheet_equation')}</p>
        </div>
        <ul className="space-y-2 text-slate-700">
          <li>• {t('tutorial.concepts.balance_sheet_assets')}</li>
          <li>• {t('tutorial.concepts.balance_sheet_liabilities')}</li>
          <li>• {t('tutorial.concepts.balance_sheet_equity')}</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-900 mb-3">{t('tutorial.concepts.cash_title')}</h3>
        <p className="text-green-800 font-semibold mb-3">{t('tutorial.concepts.cash_importance')}</p>
        <div className="space-y-2 text-green-900">
          <p>✅ {t('tutorial.concepts.cash_sources')}</p>
          <p>❌ {t('tutorial.concepts.cash_uses')}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded px-4 py-3 mt-3">
          <p className="text-yellow-900 font-semibold">⚠️ {t('tutorial.concepts.cash_warning')}</p>
        </div>
      </div>
    </div>
  );
};

const GridGuideSection = () => {
  const { t } = useTranslation();

  const sections = [
    { key: 'operations', icon: '📊', color: 'blue' },
    { key: 'capacity', icon: '⚙️', color: 'purple' },
    { key: 'growth', icon: '📈', color: 'green' },
    { key: 'finance', icon: '💳', color: 'amber' },
    { key: 'income_statement', icon: '📋', color: 'indigo' },
    { key: 'balance_sheet', icon: '🏦', color: 'slate' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.grid_guide.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.grid_guide.intro')}</p>
      </div>

      {sections.map(({ key, icon, color }) => (
        <div key={key} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            <span className="mr-2">{icon}</span>
            {t(`tutorial.grid_guide.${key}_title`)}
          </h3>
          <p className="text-slate-700 mb-3">{t(`tutorial.grid_guide.${key}_desc`)}</p>
          {t(`tutorial.grid_guide.${key}_tip`) && (
            <div className="bg-white/60 rounded px-4 py-2">
              <p className="text-sm text-slate-600">💡 {t(`tutorial.grid_guide.${key}_tip`)}</p>
            </div>
          )}
          {t(`tutorial.grid_guide.${key}_warning`) && (
            <div className="bg-yellow-50 border border-yellow-300 rounded px-4 py-2 mt-2">
              <p className="text-sm text-yellow-900">⚠️ {t(`tutorial.grid_guide.${key}_warning`)}</p>
            </div>
          )}
        </div>
      ))}

      <div className="bg-slate-100 border border-slate-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Understanding Cell Types</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white border-2 border-slate-300 rounded"></div>
            <p className="text-slate-700">{t('tutorial.grid_guide.input_vs_output')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-slate-200 border-2 border-slate-400 rounded"></div>
            <p className="text-slate-700">{t('tutorial.grid_guide.output_cells')}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-4 italic">{t('tutorial.grid_guide.tooltips')}</p>
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
    { num: 4, key: 'step4', color: 'yellow' },
    { num: 5, key: 'step5', color: 'orange' },
    { num: 6, key: 'step6', color: 'red' },
    { num: 7, key: 'step7', color: 'indigo' },
    { num: 8, key: 'step8', color: 'emerald' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.flow.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.flow.intro')}</p>
      </div>

      <div className="space-y-4">
        {steps.map(({ num, key, color }) => (
          <div key={key} className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${color}-100 border-2 border-${color}-400 flex items-center justify-center`}>
              <span className={`text-${color}-700 font-bold`}>{num}</span>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">{t(`tutorial.flow.${key}_title`)}</h3>
              <p className="text-slate-700 mb-2">{t(`tutorial.flow.${key}_desc`)}</p>
              {t(`tutorial.flow.${key}_tip`) && (
                <p className="text-sm text-slate-600 italic bg-slate-50 rounded px-3 py-2">
                  💡 {t(`tutorial.flow.${key}_tip`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_consider`) && (
                <p className="text-sm text-blue-700 bg-blue-50 rounded px-3 py-2 mt-2">
                  🤔 {t(`tutorial.flow.${key}_consider`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_warning`) && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
                  ⚠️ {t(`tutorial.flow.${key}_warning`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_deadline`) && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mt-2">
                  ⏰ {t(`tutorial.flow.${key}_deadline`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_patience`) && (
                <p className="text-sm text-indigo-700 bg-indigo-50 rounded px-3 py-2 mt-2">
                  ⏳ {t(`tutorial.flow.${key}_patience`)}
                </p>
              )}
              {t(`tutorial.flow.${key}_learn`) && (
                <p className="text-sm text-green-700 bg-green-50 rounded px-3 py-2 mt-2">
                  📚 {t(`tutorial.flow.${key}_learn`)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-900 mb-2"><strong>❓ {t('tutorial.flow.resubmission')}</strong></p>
        <p className="text-blue-800 text-sm">⏱️ {t('tutorial.flow.timing')}</p>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.tips.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.tips.intro')}</p>
      </div>

      {tips.map(({ key, icon, color }) => (
        <div key={key} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            <span className="mr-2">{icon}</span>
            {t(`tutorial.tips.${key}_title`)}
          </h3>
          <p className="text-slate-800 mb-3">{t(`tutorial.tips.${key}_desc`)}</p>

          {t(`tutorial.tips.${key}_solution`) && (
            <div className="bg-white/60 rounded px-4 py-3 mb-2">
              <p className="text-sm font-semibold text-slate-700 mb-1">Solutions:</p>
              <p className="text-sm text-slate-600">{t(`tutorial.tips.${key}_solution`)}</p>
            </div>
          )}

          {t(`tutorial.tips.${key}_prevention`) && (
            <div className="bg-white/60 rounded px-4 py-3 mb-2">
              <p className="text-sm font-semibold text-slate-700 mb-1">Prevention:</p>
              <p className="text-sm text-slate-600">{t(`tutorial.tips.${key}_prevention`)}</p>
            </div>
          )}

          {t(`tutorial.tips.${key}_too_low`) && (
            <div className="space-y-2 mb-2">
              <p className="text-sm text-slate-700">❌ {t(`tutorial.tips.${key}_too_low`)}</p>
              <p className="text-sm text-slate-700">⚠️ {t(`tutorial.tips.${key}_too_high`)}</p>
              <p className="text-sm text-green-700 font-semibold">✅ {t(`tutorial.tips.${key}_sweet_spot`)}</p>
            </div>
          )}

          {t(`tutorial.tips.${key}_formula`) && (
            <div className="bg-white/60 rounded px-4 py-3 mb-2">
              <p className="text-sm font-mono text-slate-700">{t(`tutorial.tips.${key}_formula`)}</p>
            </div>
          )}

          {t(`tutorial.tips.${key}_strategy`) && (
            <p className="text-sm text-slate-600 italic mb-2">💡 {t(`tutorial.tips.${key}_strategy`)}</p>
          )}

          {t(`tutorial.tips.${key}_example`) && (
            <p className="text-sm text-slate-600 italic">{t(`tutorial.tips.${key}_example`)}</p>
          )}

          {/* Debt-specific fields */}
          {t(`tutorial.tips.${key}_good`) && (
            <div className="space-y-2">
              <p className="text-sm text-green-700">✅ {t(`tutorial.tips.${key}_good`)}</p>
              <p className="text-sm text-blue-700">📈 {t(`tutorial.tips.${key}_leverage`)}</p>
              <p className="text-sm text-red-700">⚠️ {t(`tutorial.tips.${key}_danger`)}</p>
              <p className="text-sm text-slate-600 mt-2">{t(`tutorial.tips.${key}_types`)}</p>
            </div>
          )}

          {/* Competitors-specific fields */}
          {t(`tutorial.tips.${key}_leaderboard`) && (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">📊 {t(`tutorial.tips.${key}_leaderboard`)}</p>
              <p className="text-sm text-slate-700">📉 {t(`tutorial.tips.${key}_market`)}</p>
              <p className="text-sm text-slate-700 font-semibold">🎯 {t(`tutorial.tips.${key}_strategy`)}</p>
            </div>
          )}

          {/* Growth-specific fields */}
          {t(`tutorial.tips.${key}_tradeoff`) && (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">{t(`tutorial.tips.${key}_tradeoff`)}</p>
              <p className="text-sm text-slate-700">{t(`tutorial.tips.${key}_timing`)}</p>
              <p className="text-sm text-amber-700">📊 {t(`tutorial.tips.${key}_roe_impact`)}</p>
            </div>
          )}

          {/* Pricing-specific fields */}
          {t(`tutorial.tips.${key}_higher`) && (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">↑ {t(`tutorial.tips.${key}_higher`)}</p>
              <p className="text-sm text-slate-700">↓ {t(`tutorial.tips.${key}_lower`)}</p>
              <p className="text-sm text-green-700 font-semibold">🎯 {t(`tutorial.tips.${key}_optimal`)}</p>
              <p className="text-sm text-slate-600 mt-2 italic">{t(`tutorial.tips.${key}_market`)}</p>
            </div>
          )}

          {/* FIFO-specific fields */}
          {t(`tutorial.tips.${key}_impact`) && (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">{t(`tutorial.tips.${key}_impact`)}</p>
              <p className="text-sm text-green-700">💡 {t(`tutorial.tips.${key}_strategy`)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const GlossarySection = () => {
  const { t } = useTranslation();
  const terms = t('tutorial.glossary.terms');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tutorial.glossary.title')}</h1>
        <p className="text-lg text-slate-600">{t('tutorial.glossary.intro')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">English Term</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Spanish</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Definition</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{term.english}</td>
                <td className="px-6 py-4 text-sm text-slate-700 italic">{term.spanish}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{term.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900">{t('tutorial.glossary.footer')}</p>
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
    <div className="flex h-full bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">StratFi Tutorial</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
              title={t('tutorial.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 flex items-center justify-center gap-2 transition"
          >
            <Globe className="w-4 h-4" />
            {lang === 'en' ? '🇺🇸 → 🇪🇸 Español' : '🇪🇸 → 🇺🇸 English'}
          </button>

          {/* Section Navigation */}
          <nav className="space-y-1">
            {sections.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
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
