import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, Award, ArrowRight,
  TrendingDown, Calculator, Landmark, FileText, AlertCircle, Info, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Opportunity {
  id: number;
  title: string;
  provider: string;
  location: string;
  stipend_amount: number;
}

export default function BridgeFundingPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);

  // Expense fields (defaults to Priya's ₹8,000 barrier)
  const [travelExpense, setTravelExpense] = useState(1800);
  const [accommodationDeposit, setAccommodationDeposit] = useState(3500);
  const [equipmentExpense, setEquipmentExpense] = useState(1500);
  const [livingBuffer, setLivingBuffer] = useState(1200);
  const [useWalletSavings, setUseWalletSavings] = useState(false);

  // State
  const [calculationResult, setCalculationResult] = useState<any | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/opportunities/');
      const opps = res.data.opportunities || [];
      setOpportunities(opps);

      const solarOpp = opps.find((o: any) => o.title.includes('Tata Power') || o.title.includes('Solar'));
      if (solarOpp) {
        setSelectedOppId(solarOpp.id);
        runCalculation(solarOpp.id);
      } else if (opps.length > 0) {
        setSelectedOppId(opps[0].id);
        runCalculation(opps[0].id);
      }
    } catch {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const runCalculation = async (oppId: number) => {
    setCalculating(true);
    try {
      const res = await api.post('/bridge/calculate', {
        opportunity_id: oppId,
        expenses: {
          travel: travelExpense,
          accommodation_deposit: accommodationDeposit,
          equipment: equipmentExpense,
          living_buffer: livingBuffer,
        },
        use_wallet_balance: useWalletSavings,
      });
      setCalculationResult(res.data);
    } catch {
      // fallback calculation
      const total = travelExpense + accommodationDeposit + equipmentExpense + livingBuffer;
      const walletOffset = useWalletSavings ? 1200 : 0;
      setCalculationResult({
        total_expense: total,
        wallet_contribution: walletOffset,
        net_funding_gap: Math.max(0, total - walletOffset),
        model_type: 'Zero-Interest CSR Grant',
        recommendation: 'Approved — 100% Grant Support',
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleApply = async () => {
    if (!selectedOppId) return;
    try {
      const res = await api.post('/bridge/apply', {
        opportunity_id: selectedOppId,
        requested_amount_inr: calculationResult?.net_funding_gap || 8000,
        expense_breakdown: {
          travel: travelExpense,
          accommodation: accommodationDeposit,
          equipment: equipmentExpense,
          buffer: livingBuffer,
        },
        repayment_model: 'grant',
      });
      setSubmissionResult(res.data);
      setApplicationSubmitted(true);
      toast.success('Pehla Kadam Bridge request approved!');
    } catch {
      setApplicationSubmitted(true);
      setSubmissionResult({
        status: 'approved',
        explanation: 'Approved based on verified Tata Power apprenticeship offer, 3 skill badges in Skill Passport, and priority rural demographic index.',
      });
      toast.success('Pehla Kadam Bridge request approved in demo mode!');
    }
  };

  const totalExpense = travelExpense + accommodationDeposit + equipmentExpense + livingBuffer;
  const netGap = useWalletSavings ? Math.max(0, totalExpense - 1200) : totalExpense;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-gray-900">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Core Innovation 3 — Opportunity-Linked Transition Support
          </span>
          <span className="demo-badge">Zero-Interest CSR Model</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900">
          Pehla Kadam Bridge Calculator
        </h1>
        <p className="text-gray-600 text-xs md:text-sm max-w-2xl mt-1">
          Bridges the critical ₹5,000–₹12,000 upfront cash gap (travel, PG security deposit, safety equipment) between receiving an apprenticeship offer and the first month's stipend.
        </p>
      </div>

      {/* Act 3 Banner Highlight */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-900 font-extrabold text-sm">Act 3: The ₹8,000 Barrier (Priya's Journey)</div>
            <div className="text-xs text-gray-600 mt-0.5">
              Priya received a verified offer for the <span className="text-sky-700 font-bold">Tata Power Solar Apprenticeship in Pune</span> (₹14,500/mo stipend). However, train tickets, safety boots, and her first month's PG hostel deposit require <span className="text-amber-700 font-bold">₹8,000 upfront</span>. Pehla Kadam bridges this exact gap!
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1.5 bg-sky-100 border border-sky-200 rounded-xl text-sky-800 text-xs font-bold">
            ₹8,000 Gap Identified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Expense Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sky-600" />
                Relocation Expense Breakdown
              </h2>
              <span className="text-xs text-gray-500 font-mono font-semibold">Editable Inputs</span>
            </div>

            {/* Opportunity Selector */}
            <div>
              <label className="text-xs text-gray-600 font-bold uppercase tracking-wider block mb-1.5">
                Verified Target Opportunity
              </label>
              <select
                value={selectedOppId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedOppId(id);
                  runCalculation(id);
                }}
                className="text-xs font-bold py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 w-full"
              >
                {opportunities.map(opp => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.provider}) — {opp.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-semibold">1. Train & Transit:</span>
                  <span className="font-mono font-bold text-gray-900">₹{travelExpense}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={travelExpense}
                  onChange={(e) => {
                    setTravelExpense(Number(e.target.value));
                    if (selectedOppId) runCalculation(selectedOppId);
                  }}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-gray-500 block">Round-trip Sleeper / Express train to Pune</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-semibold">2. PG Hostel Deposit:</span>
                  <span className="font-mono font-bold text-gray-900">₹{accommodationDeposit}</span>
                </div>
                <input
                  type="range"
                  min="1500"
                  max="6000"
                  step="100"
                  value={accommodationDeposit}
                  onChange={(e) => {
                    setAccommodationDeposit(Number(e.target.value));
                    if (selectedOppId) runCalculation(selectedOppId);
                  }}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-gray-500 block">1st Month Security Deposit at Suman Mahila PG</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-semibold">3. Safety Kit & Boots:</span>
                  <span className="font-mono font-bold text-gray-900">₹{equipmentExpense}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={equipmentExpense}
                  onChange={(e) => {
                    setEquipmentExpense(Number(e.target.value));
                    if (selectedOppId) runCalculation(selectedOppId);
                  }}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-gray-500 block">Class-0 Insulated Boots, Helmet & Multimeter</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-semibold">4. Initial Living Buffer:</span>
                  <span className="font-mono font-bold text-gray-900">₹{livingBuffer}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={livingBuffer}
                  onChange={(e) => {
                    setLivingBuffer(Number(e.target.value));
                    if (selectedOppId) runCalculation(selectedOppId);
                  }}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-gray-500 block">Emergency food & commute until 1st stipend</span>
              </div>
            </div>

            {/* Wallet Savings Contribution Toggle */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900">
                  Contribute Priya's Kamao-Seekho Savings (₹1,200)
                </div>
                <div className="text-[11px] text-gray-500">
                  Reduces required CSR grant amount from ₹{totalExpense} to ₹{Math.max(0, totalExpense - 1200)}
                </div>
              </div>
              <input
                type="checkbox"
                checked={useWalletSavings}
                onChange={(e) => {
                  setUseWalletSavings(e.target.checked);
                  if (selectedOppId) runCalculation(selectedOppId);
                }}
                className="w-5 h-5 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Total Expense Bar */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-600 font-semibold">Total Pre-Joining Relocation Capital:</span>
                <div className="font-display font-extrabold text-2xl text-gray-900">
                  ₹{netGap.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  100% Eligible for CSR Grant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Decision Card & Application (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                Transparent Decision Engine
              </h2>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">Rules-Based</span>
            </div>

            {/* Decision Factors Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">1. Verified Employer Audit</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PASS (100%)</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Tata Power Renewable Energy verified through NSDC National Apprenticeship Portal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">2. Skill Passport Evidence</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PASS (95%)</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  3 verified practical tasks on record (DC Earthing, Circuit Wiring, Merchant Digitization).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">3. Priority Demographic Cohort</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PASS (100%)</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Rural ITI female technician from Ajmer district; meets CSR affirmative transition criteria.
                </p>
              </div>
            </div>

            {/* Grant Model & Waiver Terms */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Zero-Debt CSR Grant Structure
              </div>
              <ul className="space-y-1 text-gray-700 text-[11px] list-disc list-inside">
                <li><strong className="text-gray-900">Interest Rate:</strong> 0.0% (Zero Interest)</li>
                <li><strong className="text-gray-900">Repayment:</strong> ₹0 — 100% Waived automatically upon 30 days active apprenticeship attendance</li>
                <li><strong className="text-gray-900">Stipend Protection:</strong> Monthly ₹14,500 stipend is 100% retained by Priya</li>
              </ul>
            </div>

            {/* Action / Outcome */}
            {applicationSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Grant Approved for ₹{netGap.toLocaleString('en-IN')}!
                </div>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  {submissionResult?.explanation || 'Approved as a 100% CSR-funded zero-debt livelihood bridge grant.'}
                </p>
                <Link
                  to="/pravas-kavach"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Proceed to Act 4: Pravas Kavach Migration Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Submit Explainable Bridge Request (₹{netGap.toLocaleString('en-IN')})
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="text-[10px] text-gray-500 text-center italic">
              Simulation only: Demonstrates an explainable Citi CSR / NSDC student livelihood transition model. No real debt is issued.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
