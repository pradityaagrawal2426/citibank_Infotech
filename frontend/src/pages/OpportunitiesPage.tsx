import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Briefcase, Filter, CheckCircle, AlertTriangle, XCircle, ExternalLink,
  Clock, Shield, ShieldAlert, ShieldCheck, Wifi
} from 'lucide-react';
import clsx from 'clsx';

const TYPE_LABELS: Record<string, string> = {
  scholarship: '🎓 Scholarship',
  government_scheme: '🏛️ Gov. Scheme',
  vocational_training: '🔧 Vocational',
  course: '📚 Course',
  certification: '📜 Certification',
  apprenticeship: '🤝 Apprenticeship',
  internship: '💼 Internship',
  job: '💼 Job',
};

const ELIGIBILITY_STYLES: Record<string, { color: string; icon: React.ComponentType<any>; label: string }> = {
  eligible: { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle, label: 'Eligible' },
  potentially_eligible: { color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', icon: CheckCircle, label: 'Potentially Eligible' },
  check_required: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle, label: 'Check Required' },
  partially_eligible: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: AlertTriangle, label: 'Partially Eligible' },
  unknown: { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: AlertTriangle, label: 'Log In to Check' },
};

function TrustBadge({ signals }: { signals: Record<string, boolean> }) {
  const score = Object.values(signals).filter(Boolean).length;
  const max = Object.keys(signals).length;
  if (score >= 4) return <span className="flex items-center gap-1 text-xs text-green-400"><ShieldCheck className="w-3 h-3" /> High trust</span>;
  if (score >= 2) return <span className="flex items-center gap-1 text-xs text-yellow-400"><Shield className="w-3 h-3" /> Moderate trust</span>;
  return <span className="flex items-center gap-1 text-xs text-orange-400"><ShieldAlert className="w-3 h-3" /> Verify before applying</span>;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/opportunities/matched/for-me')
      .then(r => setOpportunities(r.data))
      .catch(() => api.get('/opportunities/').then(r => setOpportunities(r.data)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.opportunity_type === filter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-2">
          <Briefcase className="w-4 h-4" /> Opportunities
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">Matched opportunities</h1>
        <p className="text-slate-400 text-sm">
          Sorted by relevance and trust. All records are demo data — labelled clearly.
        </p>
        <div className="flex items-center gap-2 mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300">
            Demo records only. Never apply for opportunities without verifying details independently.
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'scholarship', 'government_scheme', 'vocational_training', 'course', 'apprenticeship', 'internship', 'job'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'py-1.5 px-3 rounded-full text-xs font-semibold border transition-all',
              filter === f ? 'bg-sky-600 border-sky-600 text-white shadow-xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            )}>
            {f === 'all' ? 'All' : TYPE_LABELS[f]?.replace(/^[^ ]+ /, '') || f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(opp => {
          const elig = opp.eligibility || {};
          const eligStyle = ELIGIBILITY_STYLES[elig.status || 'unknown'] || ELIGIBILITY_STYLES.unknown;
          const EligIcon = eligStyle.icon;

          return (
            <div key={opp.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              {/* Demo badge */}
              {opp.is_demo_record && (
                <div className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded w-fit mb-3">Demo Record</div>
              )}

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{opp.title}</h3>
                  <div className="text-xs text-gray-500 font-medium">{opp.provider}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-600">{TYPE_LABELS[opp.opportunity_type] || opp.opportunity_type}</span>
                  <TrustBadge signals={opp.trust_signals || {}} />
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">{opp.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {/* Eligibility */}
                <span className={clsx('flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold', eligStyle.color)}>
                  <EligIcon className="w-3.5 h-3.5" /> {eligStyle.label}
                </span>
                {opp.is_free && <span className="text-xs px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-full">Free</span>}
                {opp.stipend_amount && <span className="text-xs px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 font-semibold rounded-full">₹{opp.stipend_amount}/mo stipend</span>}
                {opp.award_amount && <span className="text-xs px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 font-semibold rounded-full">₹{opp.award_amount?.toLocaleString()} award</span>}
                {opp.is_remote && <span className="text-xs px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 font-semibold rounded-full flex items-center gap-1"><Wifi className="w-3.5 h-3.5" />Online</span>}
                {opp.application_deadline && (
                  <span className="text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {new Date(opp.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/opportunities/${opp.id}`}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl text-center transition-colors">
                  View Details & Checklist
                </Link>
                {opp.application_url && (
                  <a href={opp.application_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs">
                    Apply <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No opportunities found for this filter.</p>
        </div>
      )}
    </div>
  );
}
