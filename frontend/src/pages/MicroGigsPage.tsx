import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Wallet, Award, CheckCircle2, Clock, Sparkles, Filter, AlertCircle,
  ArrowRight, ShieldCheck, Store, FileCheck, Mic, ChevronRight, X, Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MicroGig {
  id: number;
  title: string;
  category: string;
  business_name?: string;
  location: string;
  description: string;
  instructions: string[];
  reward_inr: number;
  duration_minutes: number;
  difficulty: string;
  skill_awarded: string;
  skill_level: string;
  is_completed: boolean;
}

interface WalletData {
  balance_inr: number;
  lifetime_earned_inr: number;
  pending_inr: number;
  is_simulated: boolean;
  currency: string;
  disclaimer: string;
  transactions: Array<{
    id: number;
    title: string;
    amount_inr: number;
    type: string;
    description: string;
    status: string;
    date: string;
  }>;
}

export default function MicroGigsPage() {
  const [gigs, setGigs] = useState<MicroGig[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeGigModal, setActiveGigModal] = useState<MicroGig | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [checklistChecks, setChecklistChecks] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gigsRes, walletRes] = await Promise.all([
        api.get(`/micro-gigs/?category=${selectedCategory}`),
        api.get('/micro-gigs/wallet').catch(() => null),
      ]);
      setGigs(gigsRes.data.gigs || []);
      if (walletRes) setWallet(walletRes.data);
    } catch {
      toast.error('Could not load micro-gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGig = (gig: MicroGig) => {
    setActiveGigModal(gig);
    setSubmissionNotes(`Completed field check for ${gig.title}. All safety criteria audited.`);
    const checks: Record<number, boolean> = {};
    (gig.instructions || []).forEach((_, idx) => {
      checks[idx] = true;
    });
    setChecklistChecks(checks);
  };

  const handleSubmitTask = async () => {
    if (!activeGigModal) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/micro-gigs/${activeGigModal.id}/submit`, {
        submission_data: {
          notes: submissionNotes,
          checklist: checklistChecks,
          completed_at: new Date().toISOString(),
        },
      });

      toast.success(res.data.message || 'Task completed and verified!');
      setActiveGigModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-gray-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Core Innovation 2 — Learn, Earn & Prove
            </span>
            <span className="demo-badge">Simulated Earnings</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
            Kamao-Seekho Micro-Gigs
          </h1>
          <p className="text-gray-600 text-xs md:text-sm max-w-2xl mt-1">
            Complete small verified tasks for local businesses and community schemes. Earn simulated credits for transition funding while building verified Skill Passport evidence.
          </p>
        </div>

        <Link
          to="/passport"
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold transition-all w-fit shadow-2xs"
        >
          <Award className="w-4 h-4 text-violet-600" />
          View My Skill Passport
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Act 2 Guided Step Banner */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-900 font-extrabold text-sm">Act 2: The Student Earns & Proves (Priya's Journey)</div>
            <div className="text-xs text-gray-600 mt-0.5">
              Priya completed 3 verified micro-gigs, earned <span className="text-emerald-700 font-bold">₹1,200 in simulated wallet credits</span>, and unlocked verified evidence badges in her Skill Passport for circuit safety and local merchant digitization.
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            3 Gigs Completed
          </span>
        </div>
      </div>

      {/* Wallet Ledger Card */}
      {wallet && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Simulated Learning Balance</div>
                <div className="font-display font-extrabold text-3xl md:text-4xl text-gray-900">
                  ₹{wallet.balance_inr.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available to offset Pehla Kadam relocation gap
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500">Lifetime Earned:</div>
                <div className="text-lg font-extrabold text-gray-900 mt-0.5">₹{wallet.lifetime_earned_inr.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500">Verified Evidence:</div>
                <div className="text-lg font-extrabold text-amber-700 mt-0.5">{wallet.transactions.length} Badges</div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-gray-500">
            <span className="italic">{wallet.disclaimer}</span>
            <span className="text-gray-400 font-semibold">Live SQLite Ledger</span>
          </div>
        </div>
      )}

      {/* Task Feed & Filter Tabs */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Micro-Gigs' },
              { id: 'digital_saathi', label: '🏪 Digital Saathi (Local Shops)' },
              { id: 'job_verification', label: '⚡ Technical Audit' },
              { id: 'scholarship_verification', label: '📋 Scheme & Apprenticeship Audit' },
              { id: 'language_data', label: '🎙️ Voice AI Training' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            Showing {gigs.length} available tasks
          </div>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className={`bg-white rounded-2xl p-5 border transition-all card-hover flex flex-col justify-between shadow-xs ${
                gig.is_completed ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20' : 'border-gray-200'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 capitalize">
                    {gig.category.replace('_', ' ')}
                  </span>
                  <div className="text-right">
                    <span className="font-display font-extrabold text-xl text-emerald-700">
                      ₹{gig.reward_inr}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-semibold">Simulated ₹</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-sm text-gray-900 mb-1">{gig.title}</h3>
                {gig.business_name && (
                  <div className="text-xs text-amber-700 font-semibold mb-2 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    {gig.business_name}
                  </div>
                )}
                <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-3">{gig.description}</p>
              </div>

              <div>
                {/* Meta details */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      Duration:
                    </span>
                    <span className="text-gray-900 font-bold">{gig.duration_minutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Badge Awarded:
                    </span>
                    <span className="text-amber-800 font-bold">{gig.skill_awarded}</span>
                  </div>
                </div>

                {/* Action button */}
                {gig.is_completed ? (
                  <div className="w-full py-2 px-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed & Verified
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenGig(gig)}
                    className="w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    Start Task & Verify
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Submission Modal */}
      {activeGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-gray-900">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs text-sky-700 font-bold uppercase tracking-wider">
                  Kamao-Seekho Practical Task
                </span>
                <h3 className="font-display font-extrabold text-lg text-gray-900 mt-1">
                  {activeGigModal.title}
                </h3>
                <div className="text-xs text-emerald-700 font-bold mt-1">
                  Reward on Verification: ₹{activeGigModal.reward_inr} simulated credits + '{activeGigModal.skill_awarded}' Skill Badge
                </div>
              </div>
              <button
                onClick={() => setActiveGigModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 leading-relaxed">
                {activeGigModal.description}
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
                  Verification Checklist Steps
                </div>
                <div className="space-y-2">
                  {(activeGigModal.instructions || []).map((step, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all text-gray-800 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={checklistChecks[idx] ?? true}
                        onChange={(e) => setChecklistChecks({ ...checklistChecks, [idx]: e.target.checked })}
                        className="mt-0.5 rounded text-sky-600 focus:ring-0"
                      />
                      <span>{step}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-bold text-[11px] uppercase tracking-wider">
                  Submission Evidence / Field Notes
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                ⚡ Automated Gold Answer Engine will verify responses. On success, rewards credit immediately to your simulated wallet.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveGigModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTask}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Auditing & Verifying...' : 'Submit Work for Instant Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
