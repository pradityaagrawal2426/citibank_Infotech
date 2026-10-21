import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const EDUCATION_LEVELS = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Diploma', 'Graduate', 'Postgraduate'];
const STREAMS = ['Science', 'Commerce', 'Arts/Humanities', 'Vocational', 'Other'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

const INTEREST_OPTIONS = [
  'Computers & Technology', 'Mathematics', 'Data & Numbers', 'Drawing & Design',
  'Helping People', 'Healthcare', 'Nature & Farming', 'Business & Sales',
  'Electrical & Electronics', 'Cooking & Food', 'Teaching', 'Music & Arts',
  'Fixing & Building Things', 'Writing & Communication', 'Office Work',
];

const SKILL_OPTIONS = [
  'Basic Computer Usage', 'Excel/Spreadsheets', 'Typing Speed', 'Python Programming',
  'Data Entry', 'Document Formatting', 'Mobile App Usage', 'Web Browsing & Research',
  'Electrical Wiring', 'Tool Handling', 'Safety Protocols', 'Patient Care Basics',
  'Communication Skills', 'Crop Planning', 'Business Planning', 'Basic Accounting',
  'Customer Service', 'Time Management', 'Problem Solving', 'Teamwork',
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const STEPS = ['About You', 'Education', 'Interests & Skills', 'Learning Setup', 'Preferences'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    education_level: '',
    education_stream: '',
    state: '',
    district: '',
    interests: [] as string[],
    existing_skills: [] as string[],
    aspirations: '',
    has_smartphone: true,
    has_internet: true,
    has_laptop: false,
    daily_study_minutes: 60,
    financial_constraints: false,
    preferred_language: 'en',
  });

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/students/onboarding', {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        education_level: form.education_level,
      });
      toast.success('Profile saved! Finding your career matches...');
      navigate('/careers');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            {STEPS.map((s, i) => (
              <span key={s} className={clsx(i === step && 'text-sky-400 font-medium')}>{s}</span>
            ))}
          </div>
        </div>

        {/* Step 0: About You */}
        {step === 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-2xl">Tell us about yourself</h2>
            <p className="text-slate-400 text-sm">Share only what you're comfortable with. This helps us personalize your experience.</p>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Your name *</label>
              <input type="text" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Enter your name" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Age (optional)</label>
                <input type="number" value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  placeholder="e.g. 18" className="input-field" min="10" max="35" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Gender (optional)</label>
                <select value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="input-field">
                  <option value="">Prefer not to say</option>
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">State (optional)</label>
                <select value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="input-field">
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">District (optional)</label>
                <input type="text" value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="Your district" className="input-field" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Education */}
        {step === 1 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-2xl">Your education</h2>
            <p className="text-slate-400 text-sm">We use this to suggest realistic starting points, not to limit your options.</p>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Current education level *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EDUCATION_LEVELS.map(level => (
                  <button key={level}
                    onClick={() => setForm(f => ({ ...f, education_level: level }))}
                    className={clsx(
                      'py-2.5 px-3 rounded-xl text-sm font-medium border transition-all',
                      form.education_level === level
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Stream / Subject area (optional)</label>
              <div className="flex flex-wrap gap-2">
                {STREAMS.map(s => (
                  <button key={s}
                    onClick={() => setForm(f => ({ ...f, education_stream: s }))}
                    className={clsx(
                      'py-2 px-4 rounded-xl text-sm font-medium border transition-all',
                      form.education_stream === s
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Your career aspirations (optional)</label>
              <textarea value={form.aspirations}
                onChange={e => setForm(f => ({ ...f, aspirations: e.target.value }))}
                placeholder="What do you dream of doing? E.g. 'I want to support my family and work in a growing field'"
                className="input-field resize-none" rows={3} />
            </div>
          </div>
        )}

        {/* Step 2: Interests & Skills */}
        {step === 2 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-2xl">Your interests & skills</h2>
            <p className="text-slate-400 text-sm">Select all that apply. This is how we find careers that actually fit you.</p>
            <div>
              <label className="text-sm text-slate-400 mb-2 block font-medium">What do you enjoy? (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(i => (
                  <button key={i}
                    onClick={() => setForm(f => ({ ...f, interests: toggleArray(f.interests, i) }))}
                    className={clsx(
                      'py-2 px-3 rounded-xl text-xs font-medium border transition-all',
                      form.interests.includes(i)
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}>
                    {form.interests.includes(i) && <Check className="w-3 h-3 inline mr-1" />}
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block font-medium">Skills you already have (select all)</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(s => (
                  <button key={s}
                    onClick={() => setForm(f => ({ ...f, existing_skills: toggleArray(f.existing_skills, s) }))}
                    className={clsx(
                      'py-2 px-3 rounded-xl text-xs font-medium border transition-all',
                      form.existing_skills.includes(s)
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}>
                    {form.existing_skills.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Learning Setup */}
        {step === 3 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-2xl">Your learning setup</h2>
            <p className="text-slate-400 text-sm">We adapt recommendations to what you actually have access to.</p>
            {[
              { key: 'has_smartphone', label: '📱 I have a smartphone', sub: 'Even a basic Android phone works' },
              { key: 'has_internet', label: '🌐 I have regular internet access', sub: 'Even mobile data counts' },
              { key: 'has_laptop', label: '💻 I have a laptop or computer', sub: 'Not required for all careers' },
              { key: 'financial_constraints', label: '💰 I have financial constraints', sub: 'We will prioritize free opportunities' },
            ].map(({ key, label, sub }) => (
              <label key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/8 transition-colors">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                </div>
                <div
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className={clsx(
                    'w-12 h-6 rounded-full relative cursor-pointer transition-colors',
                    (form as any)[key] ? 'bg-sky-500' : 'bg-white/20'
                  )}>
                  <div className={clsx(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow',
                    (form as any)[key] ? 'left-6' : 'left-0.5'
                  )} />
                </div>
              </label>
            ))}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">How much time can you study per day?</label>
              <div className="flex gap-2 flex-wrap">
                {[30, 45, 60, 90, 120].map(mins => (
                  <button key={mins}
                    onClick={() => setForm(f => ({ ...f, daily_study_minutes: mins }))}
                    className={clsx(
                      'py-2 px-4 rounded-xl text-sm font-medium border transition-all',
                      form.daily_study_minutes === mins
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}>
                    {mins < 60 ? `${mins} min` : `${mins / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Language Preference */}
        {step === 4 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-2xl">Your preferences</h2>
            <p className="text-slate-400 text-sm">Choose your preferred language for guidance and the voice mentor.</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang.code}
                  onClick={() => setForm(f => ({ ...f, preferred_language: lang.code }))}
                  className={clsx(
                    'py-3 px-4 rounded-xl text-sm font-medium border transition-all text-left',
                    form.preferred_language === lang.code
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  )}>
                  {form.preferred_language === lang.code && <Check className="w-3 h-3 inline mr-2" />}
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
              <div className="text-sm font-medium text-teal-400 mb-1">✅ Ready to go!</div>
              <div className="text-xs text-slate-400">
                Your profile will be used to generate personalized career recommendations. 
                You can update any of this information later from your profile settings.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-xl border border-white/10 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => {
                if (step === 0 && !form.full_name) { toast.error('Please enter your name'); return; }
                if (step === 1 && !form.education_level) { toast.error('Please select your education level'); return; }
                setStep(s => s + 1);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Sparkles className="w-4 h-4" /> Find My Career Matches</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
