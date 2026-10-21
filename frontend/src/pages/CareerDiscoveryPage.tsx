import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Compass, Filter, Code, BarChart2, Zap, Heart, Sprout, FileText, ShoppingBag,
  TrendingUp, Clock, ChevronRight, Sparkles, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, BarChart2, Zap, Heart, Sprout, FileText, ShoppingBag, Compass,
};

const GROWTH_COLORS: Record<string, string> = {
  high: 'text-green-400 bg-green-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-red-400 bg-red-500/10',
};

interface Career {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  typical_education: string;
  estimated_duration_months: number;
  growth_potential: string;
  icon_name: string;
  is_vocational: boolean;
  tags: string[];
  match_score?: number;
  match_reasons?: string[];
}

interface RecommendationResponse {
  recommendations: Career[];
  personalized: boolean;
  explanation: string;
}

export default function CareerDiscoveryPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selecting, setSelecting] = useState<number | null>(null);

  useEffect(() => {
    api.get('/careers/recommendations')
      .then(r => setData(r.data))
      .catch(() => {
        // fallback: load all careers
        api.get('/careers/')
          .then(r => setData({ recommendations: r.data, personalized: false, explanation: '' }))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = data?.recommendations.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'vocational') return c.is_vocational;
    if (filter === 'tech') return c.category === 'Technology';
    return c.category.toLowerCase() === filter.toLowerCase();
  }) ?? [];

  const handleSelect = async (career: Career) => {
    setSelecting(career.id);
    try {
      await api.post(`/students/select-career/${career.id}`);
    } catch {} finally {
      setSelecting(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sky-400 text-sm font-medium mb-2">
          <Compass className="w-4 h-4" /> Career Discovery
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">Find your path</h1>
        {data?.personalized ? (
          <div className="flex items-start gap-3 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl max-w-xl">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">{data.explanation}</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              {data?.explanation || 'Complete onboarding to get personalized recommendations.'}
              {' '}<Link to="/onboarding" className="text-sky-400 hover:underline">Complete profile →</Link>
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'vocational', 'tech', 'Healthcare', 'Agriculture', 'Administration', 'Entrepreneurship'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'py-1.5 px-4 rounded-full text-xs font-semibold border transition-all capitalize',
              filter === f
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Career cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(career => {
          const Icon = ICON_MAP[career.icon_name] || Compass;
          return (
            <div key={career.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base">{career.title}</h3>
                    {career.is_vocational && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full">Vocational</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{career.category}</div>
                </div>
                {career.match_score !== undefined && (
                  <div className="text-right">
                    <div className="text-xl font-black text-sky-600">{career.match_score}%</div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">match</div>
                  </div>
                )}
              </div>

              {/* Match reasons */}
              {career.match_reasons && career.match_reasons.length > 0 && (
                <div className="mb-3 space-y-1">
                  {career.match_reasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 font-medium">
                      <span className="text-sky-600 mt-0.5">✓</span> {r}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-600 mb-4 leading-relaxed flex-1">{career.short_description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="text-center">
                  <div className="text-[10px] text-gray-400 font-semibold mb-0.5">Education</div>
                  <div className="text-xs text-gray-900 font-bold truncate">{career.typical_education}</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-[10px] text-gray-400 font-semibold mb-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />Duration</div>
                  <div className="text-xs text-gray-900 font-bold">{career.estimated_duration_months}mo est.</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-400 font-semibold mb-0.5 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Growth</div>
                  <div className={clsx('text-xs font-bold capitalize px-1.5 py-0.5 rounded-full inline-block', GROWTH_COLORS[career.growth_potential])}>
                    {career.growth_potential}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {career.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                    {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link to={`/careers/${career.slug}`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleSelect(career)}
                  disabled={selecting === career.id}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs disabled:opacity-70">
                  {selecting === career.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Choose Path <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No careers found for this filter.</p>
        </div>
      )}
    </div>
  );
}
