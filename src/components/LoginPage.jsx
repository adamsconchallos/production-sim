import { useState } from 'react';
import { LogIn, GraduationCap, User, UserPlus, Mail, Lock, Building, Briefcase } from 'lucide-react';

const LoginPage = ({ onLoginStudent, onLoginInstructor, onSignUpInstructor, onDemo, error }) => {
  const [mode, setMode] = useState('student'); // 'student' or 'teacher'
  const [teacherSubMode, setTeacherSubMode] = useState('login'); // 'login' or 'signup'

  // Shared
  const [submitting, setSubmitting] = useState(false);

  // Student Fields
  const [joinCode, setJoinCode] = useState('');
  const [firmName, setFirmName] = useState('');
  const [pin, setPin] = useState('');

  // Instructor Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'student') {
        await onLoginStudent(joinCode, firmName, pin);
      } else {
        if (teacherSubMode === 'login') {
          await onLoginInstructor(email, password);
        } else {
          await onSignUpInstructor(email, password, {
            firstName,
            lastName,
            institution,
            purpose
          });
        }
      }
    } catch (err) {
      console.error("Login/Signup error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] to-[#2d5a7b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo_transparent.png" alt="MutandisLab Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            MutandisLab
          </h1>
          <p className="text-[#4fd1c5] text-sm mt-1 font-medium">Change What Must</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'student'
                  ? 'bg-white text-[#1a365d] border-b-2 border-[#4fd1c5]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" /> Student
            </button>
            <button
              onClick={() => setMode('teacher')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'teacher'
                  ? 'bg-white text-[#1a365d] border-b-2 border-[#4fd1c5]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Instructor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {mode === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Game Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none text-lg tracking-widest text-center font-mono"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                    placeholder="Your team name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PIN</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none text-lg tracking-widest text-center font-mono"
                    placeholder="****"
                    required
                  />
                </div>
              </>
            ) : (
              /* INSTRUCTOR MODE */
              <>
                <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setTeacherSubMode('login')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${teacherSubMode === 'login' ? 'bg-white text-[#1a365d] shadow-sm' : 'text-slate-500'}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherSubMode('signup')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${teacherSubMode === 'signup' ? 'bg-white text-[#1a365d] shadow-sm' : 'text-slate-500'}`}
                  >
                    Sign Up
                  </button>
                </div>

                {teacherSubMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                      placeholder="teacher@university.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {teacherSubMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none"
                          placeholder="University or School"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teaching Purpose</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 text-sm focus:border-[#4fd1c5] focus:ring-2 focus:ring-[#4fd1c5]/20 outline-none bg-white appearance-none"
                          required
                        >
                          <option value="">Select a purpose...</option>
                          <option value="finance">Finance Course</option>
                          <option value="capstone">Capstone Project</option>
                          <option value="strategy">Strategy / Management</option>
                          <option value="economics">Economics</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4fd1c5] hover:bg-[#38b2ac] disabled:bg-[#4fd1c5]/50 text-[#1a365d] py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              {mode === 'student' ? (
                 <><LogIn className="w-4 h-4" /> {submitting ? 'Signing in...' : 'Sign In'}</>
              ) : (
                teacherSubMode === 'login' ? (
                  <><LogIn className="w-4 h-4" /> {submitting ? 'Logging in...' : 'Log In'}</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> {submitting ? 'Creating Account...' : 'Create Instructor Account'}</>
                )
              )}
            </button>
          </form>
        </div>

        {/* Demo Mode Link */}
        <div className="text-center mt-4">
          <button
            onClick={onDemo}
            className="text-sm text-[#4fd1c5] hover:text-white transition-colors font-medium"
          >
            Try Demo Mode (no login)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;