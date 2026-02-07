import { useState } from 'react';
import { Calculator, LogIn, GraduationCap, User } from 'lucide-react';

const LoginPage = ({ onLoginStudent, onLoginTeacher, onDemo, error }) => {
  const [mode, setMode] = useState('student');
  const [joinCode, setJoinCode] = useState('');
  const [firmName, setFirmName] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'student') {
        await onLoginStudent(joinCode, firmName, pin);
      } else {
        await onLoginTeacher(joinCode, pin);
      }
    } catch {
      // error is handled by useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-indigo-600" />
            StratFi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Strategy at Altitude</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'student'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" /> Student
            </button>
            <button
              onClick={() => setMode('teacher')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'teacher'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Instructor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Game Code
              </label>
              <input
                type="text"
                value={joinCode ?? ''}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg tracking-widest text-center font-mono"
                placeholder="ABC123"
                maxLength={6}
                required
              />
            </div>

            {mode === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Firm Name
                </label>
                <input
                  type="text"
                  value={firmName ?? ''}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Your team name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                PIN
              </label>
              <input
                type="password"
                value={pin ?? ''}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg tracking-widest text-center font-mono"
                placeholder="****"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Mode Link */}
        <div className="text-center mt-4">
          <button
            onClick={onDemo}
            className="text-sm text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Try Demo Mode (no login)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
