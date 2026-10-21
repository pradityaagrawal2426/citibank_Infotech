import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Compass, BookOpen, Award, Briefcase,
  Mic, Users, CheckCircle, Globe, Heart, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEMO_PERSONAS = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    description: 'Class 12 Science student from Rajasthan exploring tech careers',
    emoji: '👩‍💻',
    tags: ['Technology', 'Limited budget', 'No laptop'],
  },
  {
    id: 'raju',
    name: 'Raju Nayak',
    description: 'Class 10 student from Odisha seeking vocational training',
    emoji: '⚡',
    tags: ['Electrician', 'No internet at home', 'Hands-on learner'],
  },
  {
    id: 'kavya',
    name: 'Kavya Reddy',
    description: 'Commerce graduate from Andhra Pradesh aiming for data analysis',
    emoji: '📊',
    tags: ['Data Analytics', 'Full connectivity', 'Career switch'],
  },
  {
    id: 'facilitator',
    name: 'Facilitator View',
    description: 'See the teacher dashboard with cohort progress and student insights',
    emoji: '🏫',
    tags: ['Dashboard', 'Cohort view', 'Student progress'],
  },
];

const FEATURES = [
  {
    icon: Compass,
    title: 'DISCOVER',
    subtitle: 'AI Career Discovery',
    description: 'Find the right career based on your interests, skills, education, and real-life constraints — not just generic advice.',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: BookOpen,
    title: 'LEARN',
    subtitle: 'Personalized Roadmap',
    description: 'Step-by-step learning milestones with practical tasks, free resources, and progress you can actually track.',
    color: 'from-teal-500 to-green-600',
  },
  {
    icon: Award,
    title: 'PROVE',
    subtitle: 'Skill Passport',
    description: 'Document your abilities through practical tasks. Build a verifiable profile that speaks for you.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Briefcase,
    title: 'EARN',
    subtitle: 'Opportunity Matching',
    description: 'Find scholarships, training, apprenticeships, and jobs matched to your profile with transparent eligibility checks.',
    color: 'from-orange-500 to-red-600',
  },
];

const DIFFERENTIATORS = [
  { icon: Globe, title: 'Rural Opportunity Graph', desc: 'Connects skills → learning → evidence → real opportunities in a clear chain.' },
  { icon: Zap, title: 'Career Twin', desc: 'See exactly what skills you have, what you need, and the smallest next step.' },
  { icon: CheckCircle, title: 'Trust Engine', desc: 'Know which opportunities are verified, outdated, or need checking.' },
  { icon: Mic, title: 'Voice Mentor', desc: 'Ask questions in Hindi, Telugu, Odia and more. Get grounded answers.' },
  { icon: Heart, title: 'Facilitator Mode', desc: 'Teachers can guide many students and spot who needs help first.' },
  { icon: Award, title: 'Skill Passport', desc: 'Real evidence records — not badges for watching videos.' },
];

export default function LandingPage() {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (persona: string) => {
    try {
      await demoLogin(persona);
      toast.success(`Entered as demo: ${persona}`);
      if (persona === 'facilitator') {
        navigate('/facilitator');
      } else {
        navigate('/dashboard');
      }
    } catch {
      toast.error('Demo login failed — is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-xl">RaahSetu</span>
              <div className="text-xs text-slate-400 leading-none">Your Path. Your Future.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-xl transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/demo" className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-xl transition-colors">
                  Try Demo
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Citi India Hackathon 2026 — Education & Economic Empowerment
          </div>

          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
            From{' '}
            <span className="gradient-text">potential</span>
            {' '}to{' '}
            <span className="gradient-text">livelihood</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            RaahSetu guides students in rural India from self-discovery to concrete career opportunities — 
            with AI that explains every step, not just a score.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-sky-500/25 text-lg"
            >
              Explore Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              One connected journey
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Not another chatbot, job board, or course list. A system that guides you from who you are today to what you can become.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, idx) => (
              <div key={f.title} className="relative glass-card rounded-2xl p-6 card-hover">
                <div className="absolute top-4 right-4 text-slate-600 font-bold text-4xl font-display">
                  {idx + 1}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{f.title}</div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{f.subtitle}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Personas */}
      <section id="demo" className="py-20 px-4 bg-[#1e293b]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Try RaahSetu now
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              One-click demo access. No registration required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handleDemoLogin(persona.id)}
                className="glass-card rounded-2xl p-5 text-left card-hover hover:border-sky-500/40 border border-white/10 transition-all group"
              >
                <div className="text-4xl mb-3">{persona.emoji}</div>
                <h3 className="font-semibold text-white mb-1">{persona.name}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{persona.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {persona.tags.map(t => (
                    <span key={t} className="tag-pill">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sky-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Enter as {persona.name.split(' ')[0]}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            All demo data is clearly labelled. No real personal data is used.
          </p>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              What makes RaahSetu different
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Eight differentiating features designed for the real constraints of rural India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="glass-card rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                  <d.icon className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{d.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 bg-gradient-to-r from-sky-900/20 to-teal-900/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Rural India's untapped potential
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Millions of students in rural India face a paradox: they have potential but lack access to 
            personalized career guidance, verified opportunity information, and connected learning pathways.
            Schools lack counsellors. Digital tools are inaccessible. Opportunity listings are outdated.
          </p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { stat: 'Discover', desc: 'Careers matched to who you actually are' },
              { stat: 'Connect', desc: 'Education linked to real opportunities' },
              { stat: 'Achieve', desc: 'Practical skills that can be demonstrated' },
            ].map(item => (
              <div key={item.stat} className="glass-card rounded-xl p-4">
                <div className="font-display font-bold text-2xl gradient-text mb-1">{item.stat}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">RaahSetu</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Built for Citi India Hackathon 2026 — Education & Economic Empowerment for Rural India. 
            Demo data is clearly labelled and does not represent verified government information.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/demo" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">Demo</Link>
            <Link to="/login" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
