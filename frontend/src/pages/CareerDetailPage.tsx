import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { BookOpen, TrendingUp, Briefcase, CheckCircle, XCircle, ArrowRight, ChevronLeft } from 'lucide-react';

export default function CareerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [career, setCareer] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/careers/${slug}`),
      api.get(`/careers/${slug}/skill-gap`).catch(() => null),
    ]).then(([cRes, gRes]) => {
      setCareer(cRes.data);
      if (gRes) setSkillGap(gRes.data);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!career) return <div className="p-8 text-slate-400">Career not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <Link to="/careers" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-xs font-bold mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Careers
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
        <h1 className="font-bold text-2xl text-gray-900 mb-2">{career.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">{career.category}</span>
          {career.is_vocational && <span className="text-xs px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-full">Vocational</span>}
          <span className="text-xs px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-full">{career.work_environment}</span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">{career.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Min. Education</div>
            <div className="text-sm font-bold text-gray-900">{career.typical_education}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Est. Duration</div>
            <div className="text-sm font-bold text-gray-900">{career.estimated_duration_months} months</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Growth</div>
            <div className="text-sm font-bold text-gray-900 capitalize">{career.growth_potential}</div>
          </div>
          {career.salary_range_min && (
            <div className="col-span-2 md:col-span-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="text-xs text-amber-800 font-bold mb-1">Indicative Earnings</div>
              <div className="text-sm font-extrabold text-amber-900">₹{career.salary_range_min?.toLocaleString()} – ₹{career.salary_range_max?.toLocaleString()} / month</div>
              {career.salary_label && <div className="text-xs text-amber-700 mt-1">{career.salary_label}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Skill Gap */}
      {skillGap && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Your Skill Gap</h2>
          <p className="text-xs text-gray-500 mb-4">{skillGap.note}</p>

          {/* Readiness bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-600">Skill readiness</span>
              <span className="text-sky-600">{skillGap.readiness_percentage}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full bg-sky-600 rounded-full transition-all duration-1000"
                style={{ width: `${skillGap.readiness_percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <h3 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Skills you have ({skillGap.skills_you_have.length})
              </h3>
              <div className="space-y-1.5">
                {skillGap.skills_you_have.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-gray-800 font-medium">{s.name}</span>
                    <span className="text-gray-400">({s.level_required})</span>
                  </div>
                ))}
                {skillGap.skills_you_have.length === 0 && <div className="text-xs text-gray-400">None yet — complete micro-gigs to gain skills</div>}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-amber-600" /> Skills to develop ({skillGap.skills_to_develop.length})
              </h3>
              <div className="space-y-1.5">
                {skillGap.skills_to_develop.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-gray-800 font-medium">{s.name}</span>
                    <span className="text-gray-400">(required)</span>
                  </div>
                ))}
                {skillGap.skills_to_develop.length === 0 && <div className="text-xs text-emerald-700 font-bold">🎉 You have all required skills!</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to={`/careers/${slug}/roadmap`}
          className="flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs">
          <BookOpen className="w-4 h-4" /> Learning Roadmap
        </Link>
        <Link to={`/careers/${slug}/twin`}
          className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors">
          <TrendingUp className="w-4 h-4 text-sky-600" /> Career Twin
        </Link>
        <Link to="/opportunities"
          className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors">
          <Briefcase className="w-4 h-4 text-amber-600" /> Opportunities
        </Link>
      </div>
    </div>
  );
}
