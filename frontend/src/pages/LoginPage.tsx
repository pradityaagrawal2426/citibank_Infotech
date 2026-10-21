import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEMO_PERSONAS = [
  { id: 'priya', label: 'Priya — Tech Student', emoji: '👩‍💻' },
  { id: 'raju', label: 'Raju — Vocational', emoji: '⚡' },
  { id: 'kavya', label: 'Kavya — Data Analyst', emoji: '📊' },
  { id: 'facilitator', label: 'Facilitator View', emoji: '🏫' },
];

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials. Try a demo persona below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (persona: string) => {
    setLoading(true);
    try {
      await demoLogin(persona);
      toast.success('Demo mode activated!');
      navigate(persona === 'facilitator' ? '/facilitator' : '/dashboard');
    } catch {
      toast.error('Backend not reachable. Please start the API server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white text-2xl">RaahSetu</div>
              <div className="text-sm text-slate-400">Career Companion</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Sign in or try a demo persona</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Demo personas */}
        <div className="glass-card rounded-2xl p-5">
          <div className="text-center mb-4">
            <div className="text-sm font-medium text-slate-300 mb-1">🎯 Quick Demo Access</div>
            <div className="text-xs text-slate-500">No registration required</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => handleDemo(p.id)}
                disabled={loading}
                className="flex items-center gap-2.5 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 rounded-xl transition-all text-left disabled:opacity-50"
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-xs font-medium text-slate-300 leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            Demo password: <code className="text-slate-400">demo1234</code>
          </p>
        </div>
      </div>
    </div>
  );
}
