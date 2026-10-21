import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  ShieldAlert, ShieldCheck, Award, MessageSquare, Mic, Play, RefreshCw,
  CheckCircle2, AlertTriangle, ArrowRight, Check, HelpCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FraudScenario {
  id: number;
  title: string;
  scenario_type: string;
  channel: string;
  message_text: string;
  sender_info: string;
  red_flags: string[];
  badge_name: string;
  is_completed: boolean;
}

interface InterviewQuestion {
  id: number;
  question: string;
  context: string;
  key_criteria: string[];
}

export default function PrepDojoPage() {
  const [activeTab, setActiveTab] = useState<'fraud' | 'interview'>('fraud');

  // Fraud Dojo State
  const [scenarios, setScenarios] = useState<FraudScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<FraudScenario | null>(null);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [fraudResult, setFraudResult] = useState<any | null>(null);
  const [evaluatingFraud, setEvaluatingFraud] = useState(false);

  // Mock Saakshatkar State
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [interviewResult, setInterviewResult] = useState<any | null>(null);
  const [evaluatingInterview, setEvaluatingInterview] = useState(false);

  useEffect(() => {
    loadScenarios();
    loadQuestions();
  }, []);

  const loadScenarios = async () => {
    try {
      const res = await api.get('/prep-dojo/fraud-scenarios');
      const sc = res.data.scenarios || [];
      setScenarios(sc);
      if (sc.length > 0) {
        setActiveScenario(sc[0]);
        setSelectedFlags([]);
        setFraudResult(null);
      }
    } catch {
      toast.error('Failed to load fraud scenarios');
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await api.get('/prep-dojo/interview-questions/solar-microgrid-technician');
      const qs = res.data.questions || [];
      setInterviewQuestions(qs);
      // Pre-fill with Priya's strong technical sample answers
      const defaultAns: Record<number, string> = {
        1: 'First isolate the DC circuit breaker and lock it out. Use a certified multimeter rated for 1000V DC to verify zero voltage before touching any terminal.',
        2: 'Check 1: Inspect solar string DC input voltage at the inverter input terminals. Check 2: Check inverter fault codes on the digital display and reset if transient. Check 3: Check grid AC breaker and earthing connection.',
        3: 'I always explain to village elders and the Sarpanch that earthing prevents lightning damage and keeps livestock safe from shock leakage.',
      };
      setAnswers(defaultAns);
    } catch {
      toast.error('Failed to load interview questions');
    }
  };

  const handleToggleFlag = (flag: string) => {
    if (selectedFlags.includes(flag)) {
      setSelectedFlags(selectedFlags.filter(f => f !== flag));
    } else {
      setSelectedFlags([...selectedFlags, flag]);
    }
  };

  const handleEvaluateFraud = async () => {
    if (!activeScenario) return;
    if (selectedFlags.length === 0) {
      toast.error('Please select at least one red flag');
      return;
    }
    setEvaluatingFraud(true);
    try {
      const res = await api.post('/prep-dojo/evaluate-fraud', {
        scenario_id: activeScenario.id,
        flagged_reasons: selectedFlags,
      });
      setFraudResult(res.data);
      toast.success('Fraud Dojo analysis complete! Badge added to passport.');
      loadScenarios();
    } catch {
      toast.error('Evaluation error');
    } finally {
      setEvaluatingFraud(false);
    }
  };

  const handleEvaluateInterview = async () => {
    setEvaluatingInterview(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        question: interviewQuestions.find(q => q.id === Number(qId))?.question || '',
        answer: ans,
      }));

      const res = await api.post('/prep-dojo/evaluate-interview', {
        career_slug: 'solar-microgrid-technician',
        answers: formattedAnswers,
      });
      setInterviewResult(res.data);
      toast.success('Mock Interview evaluated! Score: ' + res.data.overall_score + '%');
    } catch {
      toast.error('Interview evaluation error');
    } finally {
      setEvaluatingInterview(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-gray-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Supporting Features 2 & 3 — Vigilance & Interview Mastery
            </span>
            <span className="demo-badge">Interactive Practice</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
            Prep Dojo — Fraud Defense & Mock Interviews
          </h1>
          <p className="text-gray-600 text-xs md:text-sm max-w-2xl mt-1">
            Build resilience against fraudulent recruitment schemes and master practical trade interviews for your selected apprenticeship.
          </p>
        </div>

        <Link
          to="/passport"
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold transition-all w-fit shadow-2xs"
        >
          <Award className="w-4 h-4 text-violet-600" />
          View Badges in Skill Passport
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('fraud')}
          className={`py-2 px-4 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'fraud'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Fraud Dojo (Scam Hunter)
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`py-2 px-4 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'interview'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Mock Saakshatkar (Trade Interview)
        </button>
      </div>

      {/* Tab 1: Fraud Dojo */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc);
                  setSelectedFlags([]);
                  setFraudResult(null);
                }}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeScenario?.id === sc.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{sc.title}</span>
                {sc.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            ))}
          </div>

          {activeScenario && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Simulated Incoming Message (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Simulated Scam Message
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{activeScenario.channel}</span>
                  </div>

                  {/* Phone Mock Display */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 font-mono text-xs">
                    <div className="text-gray-500 text-[11px] pb-2 border-b border-gray-200 flex justify-between">
                      <span>Sender: {activeScenario.sender_info}</span>
                      <span className="text-amber-700 font-bold">Unverified Number</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 leading-relaxed font-sans text-xs">
                      {activeScenario.message_text}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                    💡 <strong>Task:</strong> Inspect this message. Check all the red flags on the right that indicate this is fraudulent before submitting.
                  </div>
                </div>
              </div>

              {/* Right Column: Red Flag Inspector (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                  <h3 className="font-display font-extrabold text-base text-gray-900">
                    Identify the Red Flags
                  </h3>

                  <div className="space-y-2 text-xs">
                    {(activeScenario.red_flags || []).map((flag, idx) => {
                      const isSelected = selectedFlags.includes(flag);
                      return (
                        <label
                          key={idx}
                          onClick={() => handleToggleFlag(flag)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mt-0.5 rounded text-rose-600 focus:ring-0"
                          />
                          <span>{flag}</span>
                        </label>
                      );
                    })}
                  </div>

                  {fraudResult ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-2 text-emerald-950 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Scam Neutralized! Score: {fraudResult.score}%
                      </div>
                      <p className="text-gray-700 leading-relaxed">{fraudResult.explanation}</p>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-amber-800 font-bold text-[11px] flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        Badge Earned: '{fraudResult.badge_awarded}' added to Skill Passport!
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEvaluateFraud}
                      disabled={evaluatingFraud}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                    >
                      {evaluatingFraud ? 'Analyzing Flags...' : 'Submit Fraud Audit & Claim Badge'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mock Saakshatkar */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-sky-700 font-bold uppercase tracking-wider">
                  Targeted Role: Solar Microgrid Maintenance Technician
                </span>
                <h2 className="font-display font-extrabold text-lg text-gray-900 mt-1">
                  Apprentice Technical & Safety Interview Simulator
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Questions derived from Tata Power Renewable Energy industrial apprenticeship standards.
                </p>
              </div>

              {interviewResult && (
                <div className="text-right">
                  <div className="font-display font-extrabold text-3xl text-emerald-700">{interviewResult.overall_score}%</div>
                  <div className="text-xs text-gray-500 font-semibold">Readiness Score</div>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {interviewQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-sky-700 font-extrabold uppercase">QUESTION {idx + 1} OF {interviewQuestions.length}</span>
                      <h3 className="font-display font-bold text-sm text-gray-900">{q.question}</h3>
                      <div className="text-[11px] text-gray-500 italic">Context: {q.context}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-700 block mb-1 font-bold">Your Spoken / Written Response:</label>
                    <textarea
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 text-xs"
                      placeholder="Type your answer or paste transcribed response..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 pt-1">
                    <span className="font-bold text-gray-800">Key Criteria:</span>
                    {q.key_criteria.map((kc, kIdx) => (
                      <span key={kIdx} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action / Evaluation Card */}
            {interviewResult ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 space-y-4 text-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Interview Passed! Score: {interviewResult.overall_score}%
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs border border-amber-200">
                    Badge: {interviewResult.badge_awarded}
                  </span>
                </div>

                {/* Rubric Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {Object.entries(interviewResult.rubric_scores || {}).map(([rubricKey, score]: any) => (
                    <div key={rubricKey} className="p-3 rounded-lg bg-white border border-gray-200">
                      <div className="text-gray-500 capitalize text-[11px] font-semibold">{rubricKey.replace('_', ' ')}</div>
                      <div className="font-bold text-base text-gray-900 mt-0.5">{score}%</div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Tips */}
                <div className="space-y-2 text-xs text-gray-700 pt-2 border-t border-gray-200">
                  <div className="font-bold text-gray-900">Demonstrated Strengths:</div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                    {(interviewResult.strengths || []).map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>

                  <div className="font-bold text-gray-900 pt-2">Actionable Field Tips:</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-[11px]">
                    {(interviewResult.actionable_feedback || []).map((f: string, idx: number) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEvaluateInterview}
                disabled={evaluatingInterview}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {evaluatingInterview ? 'Evaluating Technical Responses...' : 'Evaluate Interview Responses'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
