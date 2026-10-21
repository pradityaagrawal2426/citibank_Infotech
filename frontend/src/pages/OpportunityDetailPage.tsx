import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import {
  ChevronLeft, CheckCircle, XCircle, AlertTriangle, ExternalLink,
  Shield, ShieldCheck, ShieldAlert, Clock, Square, CheckSquare
} from 'lucide-react';
import clsx from 'clsx';

const TRUST_SIGNAL_LABELS: Record<string, string> = {
  official_source_linked: 'Official source linked',
  recently_checked: 'Recently verified',
  deadline_known: 'Deadline stated',
  eligibility_complete: 'Full eligibility info',
  link_available: 'Application link provided',
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    api.get(`/opportunities/${id}`)
      .then(r => setOpp(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!opp) return <div className="p-8 text-slate-400">Opportunity not found.</div>;

  const elig = opp.eligibility || {};
  const trustSignals = opp.trust_signals || {};
  const trustScore = opp.trust_score || 0;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <Link to="/opportunities" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Opportunities
      </Link>

      {/* Demo warning */}
      {opp.is_demo_record && (
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            This is a <strong>demo record</strong> for illustration purposes only.
            Do not treat this as a real, verified opportunity. Always verify details directly with the provider.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <h1 className="font-display font-bold text-2xl mb-1">{opp.title}</h1>
        <div className="text-sky-400 text-sm mb-4">{opp.provider}</div>

        <p className="text-slate-300 text-sm leading-relaxed mb-5">{opp.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Type', value: opp.opportunity_type?.replace('_', ' ') },
            { label: 'Location', value: opp.location || (opp.is_remote ? 'Online' : 'Not specified') },
            opp.is_free ? { label: 'Cost', value: '✅ Free' } : { label: 'Cost', value: `₹${opp.cost_inr?.toLocaleString()}` },
            opp.stipend_amount ? { label: 'Stipend', value: `₹${opp.stipend_amount}/month` } : null,
            opp.award_amount ? { label: 'Award', value: `₹${opp.award_amount?.toLocaleString()}` } : null,
            opp.duration_months ? { label: 'Duration', value: `${opp.duration_months} months` } : null,
            opp.min_education ? { label: 'Min Education', value: opp.min_education } : null,
            (opp.min_age || opp.max_age) ? { label: 'Age', value: `${opp.min_age || ''}${opp.max_age ? `–${opp.max_age}` : '+'} years` } : null,
            opp.application_deadline ? { label: 'Deadline', value: new Date(opp.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) } : null,
          ].filter(Boolean).map((item: any) => (
            <div key={item.label} className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
              <div className="text-sm text-white font-medium capitalize">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility */}
      <div className="glass-card rounded-2xl p-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-3">Your Eligibility</h2>
        <div className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium mb-4',
          elig.status === 'eligible' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
          elig.status === 'potentially_eligible' ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' :
          'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
        )}>
          {elig.status === 'eligible' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {elig.status?.replace('_', ' ') || 'Unknown'}
        </div>

        {elig.passed_checks?.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-green-400 font-medium mb-2">✅ Requirements met</div>
            {elig.passed_checks.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400 mb-1">
                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> {c}
              </div>
            ))}
          </div>
        )}

        {elig.issues?.length > 0 && (
          <div>
            <div className="text-xs text-orange-400 font-medium mb-2">⚠️ Issues to address</div>
            {elig.issues.map((issue: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400 mb-1">
                <XCircle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" /> {issue}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Engine */}
      <div className="glass-card rounded-2xl p-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-sky-400" /> Trust & Freshness
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Source reliability and freshness are checked separately. A reputable source can still contain outdated information.
        </p>
        <div className="space-y-2">
          {Object.entries(TRUST_SIGNAL_LABELS).map(([key, label]) => {
            const present = trustSignals[key] === true;
            return (
              <div key={key} className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                present ? 'bg-green-500/5 border border-green-500/10' : 'bg-white/5 border border-white/5'
              )}>
                {present ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={present ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Checklist */}
      {opp.action_checklist && opp.action_checklist.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-5">
          <h2 className="font-display font-bold text-lg mb-3">Action Checklist</h2>
          <p className="text-xs text-slate-500 mb-4">
            Complete these steps to apply for this opportunity.
          </p>
          <div className="space-y-2">
            {opp.action_checklist.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                  checkedItems[idx]
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                )}
              >
                {checkedItems[idx] ? (
                  <CheckSquare className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
                <span className={clsx('text-sm', checkedItems[idx] ? 'text-green-400 line-through opacity-70' : 'text-slate-300')}>
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      {opp.application_url ? (
        <a
          href={opp.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-orange-500/20"
        >
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <div className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-slate-500 font-medium rounded-2xl">
          Application link not available — contact provider directly
        </div>
      )}
    </div>
  );
}
