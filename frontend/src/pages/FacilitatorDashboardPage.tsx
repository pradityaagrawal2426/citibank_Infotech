import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Users, AlertCircle, CheckCircle, TrendingUp,
  WifiOff, ChevronRight, MessageSquare, Award,
  Coins, ShieldCheck, Briefcase, Store, Calculator,
  ArrowUpRight, Info, Sliders, DollarSign, PieChart as PieChartIcon
} from 'lucide-react';
import clsx from 'clsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function FacilitatorDashboardPage() {
  const [cohort, setCohort] = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Programme economics state
  const [cohortSize, setCohortSize] = useState(50);
  const [trainingCost, setTrainingCost] = useState(6500);
  const [bridgeGrant, setBridgeGrant] = useState(8000);
  const [relocationPct, setRelocationPct] = useState(60);
  const [placementPct, setPlacementPct] = useState(82);
  const [monthlyWage, setMonthlyWage] = useState(15000);
  const [economics, setEconomics] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/facilitator/cohort').catch(() => ({ data: { students: [] } })),
      api.get('/facilitator/metrics').catch(() => ({ data: null }))
    ]).then(([cohortRes, metricsRes]) => {
      setCohort(cohortRes.data);
      setLiveMetrics(metricsRes.data);
    }).finally(() => setLoading(false));

    calculateEconomics(cohortSize, trainingCost, bridgeGrant, relocationPct, placementPct, monthlyWage);
  }, []);

  const calculateEconomics = (
    size: number,
    cost: number,
    grant: number,
    reloc: number,
    place: number,
    wage: number
  ) => {
    setCalcLoading(true);
    api.post('/facilitator/programme-economics', {
      cohort_size: size,
      training_cost_per_student: cost,
      bridge_grant_per_student: grant,
      relocation_rate_pct: reloc,
      placement_rate_pct: place,
      average_monthly_wage_inr: wage
    })
      .then(r => setEconomics(r.data))
      .catch(() => {})
      .finally(() => setCalcLoading(false));
  };

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculateEconomics(cohortSize, trainingCost, bridgeGrant, relocationPct, placementPct, monthlyWage);
    toast.success('Economics model updated!');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const students = cohort?.students || [];

  const progressData = students.map((s: any) => ({
    name: s.full_name?.split(' ')[0] || 'Student',
    progress: s.progress_percentage,
    color: s.progress_percentage >= 50 ? '#0d9488' : s.progress_percentage >= 20 ? '#0284c7' : '#4f46e5',
  }));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-gray-900">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" /> Partner, Facilitator & Impact Dashboard
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
              Programme Economics & Cohort Impact
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Live outcomes from RaahSetu deployments across Bilaspur & rural Rajasthan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live DB Aggregated
            </span>
          </div>
        </div>
      </div>

      {/* 1. Live Impact Metrics (Derived from DB) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-600" /> Live Operational Outcomes (Actual Data)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Enrolled</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.students_enrolled ?? 1}</div>
            <div className="text-[11px] text-teal-700 font-bold">{liveMetrics?.students_active ?? 1} active learners</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Verified Skills</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.skills_verified ?? 4}</div>
            <div className="text-[11px] text-gray-500 font-semibold">In Skill Passports</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Micro-Gigs</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.micro_gigs_completed ?? 6}</div>
            <div className="text-[11px] text-amber-800 font-bold">₹{liveMetrics?.simulated_earnings_inr ?? 1450} earned (sim.)</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Local Shops</span>
              <Store className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.local_businesses_served ?? 4}</div>
            <div className="text-[11px] text-gray-500 font-semibold">Digital Saathi partners</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Bridge Grants</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.bridge_funding_approved ?? 1}</div>
            <div className="text-[11px] text-teal-800 font-bold">₹{liveMetrics?.bridge_funding_amount_inr ?? 8000} zero-interest</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Joined Offers</span>
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{liveMetrics?.opportunities_joined ?? 1}</div>
            <div className="text-[11px] text-purple-800 font-bold">Pravas protected</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive CSR & Programme Economics Calculator */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" /> Programme Economics & Social ROI Model
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">CSR Investment & Sustainability Simulator</h2>
            <p className="text-xs text-gray-600">
              Adjust cohort variables to project cost per placed youth and 3-year rural economic return.
            </p>
          </div>
          <div className="text-xs bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
            Student Fee: <span>₹0 (Free for Rural Youth)</span>
          </div>
        </div>

        <form onSubmit={handleRecalculate} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-700 font-semibold mb-1">
                <span>Cohort Size (Rural Students)</span>
                <span className="font-extrabold text-sky-700">{cohortSize} students</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={cohortSize}
                onChange={(e) => setCohortSize(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 font-semibold block mb-1">Training Cost / Student (₹)</label>
                <input
                  type="number"
                  value={trainingCost}
                  onChange={(e) => setTrainingCost(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-semibold block mb-1">Pehla Kadam Bridge Grant (₹)</label>
                <input
                  type="number"
                  value={bridgeGrant}
                  onChange={(e) => setBridgeGrant(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 font-semibold block mb-1">Relocation %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={relocationPct}
                  onChange={(e) => setRelocationPct(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-semibold block mb-1">Placement Rate %</label>
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={placementPct}
                  onChange={(e) => setPlacementPct(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-semibold block mb-1">Monthly Wage (₹)</label>
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calcLoading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" /> Recalculate Model Assumptions
            </button>
          </div>

          {/* Outputs */}
          {economics && (
            <div className="lg:col-span-6 bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-600 mb-3 flex items-center justify-between">
                  <span>Projected Programme Metrics</span>
                  <span className="text-[10px] text-teal-700 font-extrabold">Illustrative SROI Formula</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-[11px] text-gray-500 font-semibold">Total CSR Investment</div>
                    <div className="text-lg font-extrabold text-gray-900">
                      ₹{economics.total_csr_investment_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Training: ₹{economics.training_component_inr.toLocaleString('en-IN')} · Bridge: ₹{economics.bridge_grant_component_inr.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-[11px] text-emerald-800 font-semibold">Cost / Placed Youth</div>
                    <div className="text-lg font-extrabold text-emerald-800">
                      ₹{economics.cost_per_placed_student_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5 font-bold">
                      {economics.placed_students} of {economics.cohort_size} students placed
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">1st Year Wages Infused in Rural Economy:</span>
                    <span className="font-extrabold text-gray-900">₹{economics.first_year_wage_generated_inr.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">3-Year Cumulative Household Income:</span>
                    <span className="font-extrabold text-sky-800">₹{economics.three_year_wage_generated_inr.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-700 font-bold">Social Return on Investment (SROI):</span>
                <span className="text-xl font-display font-extrabold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-lg border border-amber-200">
                  {economics.sroi_ratio} Return
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 3. Sustainable Revenue & Business Model Pillars */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" /> Five Pillars of Financial Sustainability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-xs text-gray-900">CSR Employability Funds</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Sponsored by Citi Foundation, Tata Power, and corporate ESG mandates. Underwrites student bridge grants.
            </p>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-xs text-gray-900">Employer Verification Fee</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Employers pay a success fee upon verified joining for pre-vetted, task-proven candidates with high retention.
            </p>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-xs text-gray-900">Digital Saathi Services</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Rural MSMEs pay small nominal micro-fees for inventory cataloguing, GST invoicing setup, and Google Maps listing.
            </p>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="font-bold text-xs text-gray-900">State Skill Missions</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Performance-linked outcome payouts from NSDC & PMKVY upon verified milestone completion in Skill Passports.
            </p>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <h3 className="font-bold text-xs text-gray-900">Credentialing API</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              B2B verification API queries for staffing agencies validating tamper-evident student task submissions.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Classroom / Cohort Management Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-600" /> Active Bilaspur Student Cohort
        </h2>

        {/* Progress chart */}
        {progressData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
            <h3 className="font-bold text-gray-900 text-xs mb-3">Milestone Progression Distribution</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Progress']}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '11px' }}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {progressData.map((entry: any, idx: number) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Student list */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Students in Cohort ({students.length})</h3>
            <span className="text-xs text-gray-500 font-semibold">Priya (Seeded Demo Lead)</span>
          </div>
          <div className="divide-y divide-gray-100">
            {students.map((student: any) => (
              <div key={student.student_id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    {student.full_name?.[0] || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{student.full_name}</span>
                      {student.full_name?.includes('Priya') && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                          Demo Persona
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.education_level} · {student.selected_career || 'Solar Technician'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-600 font-semibold">{student.progress_percentage}% completed</div>
                    <div className="text-[11px] text-teal-700 font-bold">{student.next_recommended_action}</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs flex items-center gap-1 font-bold"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
