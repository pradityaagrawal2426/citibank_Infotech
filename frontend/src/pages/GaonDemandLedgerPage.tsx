import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Activity, Volume2, Mic, Users, TrendingUp, Sparkles, AlertTriangle,
  ArrowRight, ShieldCheck, MapPin, Zap, ChevronRight, CheckCircle2,
  RefreshCw, PlusCircle, Radio
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DemandCategory {
  id: number;
  village: string;
  district: string;
  state: string;
  title: string;
  category_slug: string;
  description: string;
  household_count: number;
  confidence_score: number;
  urgency_level: string;
  sample_quotes: string[];
  mapped_career_slugs: string[];
  potential_monthly_market_inr: number;
  response_count: number;
}

interface DemandResponse {
  id: number;
  respondent_name: string;
  respondent_type: string;
  input_channel: string;
  transcript_en: string;
  transcript_hi?: string;
  confidence: number;
  sentiment: string;
  timestamp: string;
}

export default function GaonDemandLedgerPage() {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<DemandCategory[]>([]);
  const [responses, setResponses] = useState<DemandResponse[]>([]);
  const [selectedVillage, setSelectedVillage] = useState('Bilaspur');
  const [loading, setLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [newResponseText, setNewResponseText] = useState('');
  const [respondentName, setRespondentName] = useState('Ratan Singh');
  const [respondentType, setRespondentType] = useState('Farmer (Tubewell Owner)');
  const [isRecording, setIsRecording] = useState(false);
  const [recentShift, setRecentShift] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedVillage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, respRes] = await Promise.all([
        api.get(`/demand-ledger/categories?village=${selectedVillage}`),
        api.get('/demand-ledger/responses'),
      ]);
      setCategories(catRes.data.categories || []);
      setResponses(respRes.data.responses || []);
    } catch {
      toast.error('Could not load demand ledger data');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVoice = async () => {
    if (!newResponseText.trim()) {
      toast.error('Please enter a voice transcription or use the microphone');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/demand-ledger/responses', {
        village: selectedVillage,
        respondent_name: respondentName,
        respondent_type: respondentType,
        transcript_en: newResponseText,
        transcript_hi: newResponseText,
        input_channel: 'voice',
      });
      toast.success(res.data.message || 'Demand signal registered!');
      setRecentShift(res.data.career_shifts?.[0] || null);
      setIsVoiceModalOpen(false);
      setNewResponseText('');
      loadData();
    } catch {
      toast.error('Error submitting voice signal');
    } finally {
      setSubmitting(false);
    }
  };

  const simulateSpeechRecognition = () => {
    setIsRecording(true);
    setTimeout(() => {
      setNewResponseText("Our tubewell solar inverter tripped twice this morning. The junction box is overheating in the afternoon sun and water output has dropped by half.");
      setIsRecording(false);
      toast.success('Voice captured & transcribed from Marwari/Hindi speech audio!');
    }, 1500);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-gray-900">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Core Innovation 1 — Real-Time Rural Demand
            </span>
            <span className="demo-badge">Verified Signals</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
            Gaon Demand Ledger
          </h1>
          <p className="text-gray-600 text-xs md:text-sm max-w-2xl mt-1">
            Aggregating household voice & text signals to quantify unmet technical services. Connects local village demand directly to career recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="text-xs font-bold py-2 px-3 bg-white border border-gray-300 rounded-xl text-gray-800 shadow-2xs"
          >
            <option value="Bilaspur">📍 Bilaspur (Ajmer, Rajasthan)</option>
            <option value="Shivpuri">📍 Shivpuri (Madhya Pradesh)</option>
            <option value="Koraput">📍 Koraput (Odisha)</option>
          </select>

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Mic className="w-4 h-4" />
            + Simulate Voice Signal
          </button>
        </div>
      </div>

      {/* Act 1 Banner Highlight */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-900 font-extrabold text-sm">Act 1: The Village Need (Priya's Journey)</div>
            <div className="text-xs text-gray-600 mt-0.5">
              84 households in Bilaspur urgently reported broken solar tubewells & unserviced inverters. This demand signal pushed <span className="text-sky-700 font-bold">Solar Microgrid Maintenance Technician</span> to #1 rank with a 94.5% match!
            </div>
          </div>
        </div>
        <Link
          to="/careers/solar-microgrid-technician"
          className="shrink-0 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
        >
          View Recommended Career
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Career Shift Notification (if simulated) */}
      {recentShift && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-gray-900 text-sm">Career Recommendation Recalculated!</div>
            <div className="text-gray-700 mt-1">{recentShift.explanation}</div>
            <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-emerald-800">
              <span>Previous Match: {recentShift.previous_match_score}%</span>
              <span>→</span>
              <span className="font-bold text-gray-900">Updated Match: {recentShift.updated_match_score}%</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-sans font-bold">{recentShift.rank_change}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Demand Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-extrabold text-lg text-gray-900 flex items-center gap-2">
            <span>Local Demand Clusters in {selectedVillage}</span>
            <span className="text-xs text-gray-500 font-normal">({categories.length} verified categories)</span>
          </h2>
          <div className="text-xs text-gray-500">Sorted by household urgency</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl p-5 border transition-all card-hover shadow-xs ${
                idx === 0 ? 'border-sky-500/80 ring-2 ring-sky-500/20' : 'border-gray-200'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  cat.urgency_level === 'Critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : cat.urgency_level === 'High'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {cat.urgency_level} Need
                </span>

                <div className="text-right">
                  <div className="font-display font-extrabold text-2xl text-gray-900">{cat.household_count}</div>
                  <div className="text-[10px] font-semibold text-gray-500">Households</div>
                </div>
              </div>

              <h3 className="font-display font-bold text-sm text-gray-900 mb-1.5 line-clamp-1">{cat.title}</h3>
              <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">{cat.description}</p>

              {/* Confidence Meter */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1 font-semibold">
                  <span>Confidence Index</span>
                  <span className="font-bold text-emerald-700">{cat.confidence_score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full"
                    style={{ width: `${cat.confidence_score}%` }}
                  />
                </div>
              </div>

              {/* Monthly Market */}
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-3 flex items-center justify-between text-xs">
                <span className="text-gray-600">Est. Monthly Market:</span>
                <span className="font-mono font-bold text-gray-900">₹{cat.potential_monthly_market_inr.toLocaleString('en-IN')}/mo</span>
              </div>

              {/* Sample Voice Quote */}
              {cat.sample_quotes && cat.sample_quotes.length > 0 && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 mb-3 text-xs italic text-gray-700 flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>"{cat.sample_quotes[0]}"</span>
                </div>
              )}

              {/* Linked Career Pathway */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">Connected Career:</div>
                <Link
                  to={`/careers/${cat.mapped_career_slugs[0] || 'solar-microgrid-technician'}`}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  Explore Roadmap
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Signals Feed */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-sky-600" />
              Live Village Voice Signals ({selectedVillage})
            </h2>
            <p className="text-xs text-gray-500">Verbatim transcripts from rural telephonic surveys and Panchayat voice drops</p>
          </div>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Listening Active
          </span>
        </div>

        <div className="space-y-3">
          {responses.map((resp) => (
            <div key={resp.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">{resp.respondent_name}</span>
                  <span className="text-xs text-gray-500">• {resp.respondent_type}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                    {resp.input_channel} input
                  </span>
                </div>
                <div className="text-xs text-gray-700">"{resp.transcript_en}"</div>
                {resp.transcript_hi && (
                  <div className="text-xs text-gray-500 font-hindi">"{resp.transcript_hi}"</div>
                )}
              </div>

              <div className="shrink-0 text-right text-xs">
                <div className="text-emerald-700 font-bold">{resp.confidence}% confidence</div>
                <div className="text-gray-500 text-[11px]">{resp.sentiment} priority</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate Voice Signal Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl text-gray-900">
            <h3 className="font-display font-extrabold text-lg text-gray-900 mb-1">
              Simulate Household Voice Input
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Enter or speak a village need. The engine will update confidence scores and recalculate career recommendation rankings in real time.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="text-gray-700 font-semibold mb-1 block">Respondent Name</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold mb-1 block">Household Role</label>
                <input
                  type="text"
                  value={respondentType}
                  onChange={(e) => setRespondentType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-700 font-semibold">Spoken Complaint / Requirement</label>
                  <button
                    onClick={simulateSpeechRecognition}
                    disabled={isRecording}
                    className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-bold"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isRecording ? 'Listening...' : 'Simulate Microphone'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newResponseText}
                  onChange={(e) => setNewResponseText(e.target.value)}
                  placeholder="e.g., Solar pump inverter is tripped; no local technician in Bilaspur..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateVoice}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Recording...' : 'Record Signal & Recalculate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
