import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight, Sparkles } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Class 12 Science Student',
    location: 'Ajmer, Rajasthan',
    emoji: '👩‍💻',
    journey: 'From curiosity about computers to data analyst pathway',
    constraints: ['No laptop', 'Limited budget', 'Smartphone only'],
    tags: ['Technology', 'Data', 'Mobile learner'],
    highlight: 'See how career recommendations adapt to real-life constraints',
  },
  {
    id: 'raju',
    name: 'Raju Nayak',
    role: 'Class 10 Student',
    location: 'Koraput, Odisha',
    emoji: '⚡',
    journey: 'From interest in fixing things to certified electrician pathway',
    constraints: ['No internet at home', 'No laptop', 'Limited daily time'],
    tags: ['Vocational', 'Electrician', 'Offline-first'],
    highlight: 'Explore the offline-first learning experience for limited connectivity',
  },
  {
    id: 'kavya',
    name: 'Kavya Reddy',
    role: 'Commerce Graduate',
    location: 'Kurnool, Andhra Pradesh',
    emoji: '📊',
    journey: 'From spreadsheet skills to data analyst career',
    constraints: ['Has laptop', 'Good connectivity'],
    tags: ['Data Analytics', 'Full access', 'Career progression'],
    highlight: 'See the complete journey from skill gap to opportunity matching',
  },
  {
    id: 'facilitator',
    name: 'Facilitator View',
    role: 'Community Teacher / Facilitator',
    location: 'Manages a cohort of students',
    emoji: '🏫',
    journey: "Helping 3 students at once from a single dashboard",
    constraints: [],
    tags: ['Cohort management', 'Progress tracking', 'Teacher view'],
    highlight: 'See how one teacher can support many students efficiently',
  },
];

export default function DemoPage() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleEnter = async (persona: string) => {
    try {
      await demoLogin(persona);
      toast.success('Demo activated!');
      navigate(persona === 'facilitator' ? '/facilitator' : '/dashboard');
    } catch {
      toast.error('Cannot connect to backend. Please start the API server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] py-20 px-4">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Hackathon Demo — No login required
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Choose a demo persona
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Each persona shows a different student journey and set of real-world constraints.
            All data is clearly labelled as illustrative demo content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_PERSONAS.map(p => (
            <div key={p.id} className="glass-card rounded-2xl p-6 card-hover border border-white/10 hover:border-sky-500/30 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{p.emoji}</div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">{p.name}</h2>
                  <div className="text-sky-400 text-sm">{p.role}</div>
                  <div className="text-slate-500 text-xs mt-0.5">📍 {p.location}</div>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 italic">"{p.journey}"</p>

              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 mb-4">
                <div className="text-xs text-sky-400 font-medium">🔍 What to look for</div>
                <div className="text-xs text-slate-300 mt-1">{p.highlight}</div>
              </div>

              {p.constraints.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">Constraints:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.constraints.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mb-5">
                {p.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
              </div>

              <button
                onClick={() => handleEnter(p.id)}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                Enter as {p.name.split(' ')[0]}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          RaahSetu demo — Citi India Hackathon 2026 · No real personal data used · All opportunity records are illustrative
        </p>
      </div>
    </div>
  );
}
