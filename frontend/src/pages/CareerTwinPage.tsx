import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { TrendingUp, CheckCircle, XCircle, ArrowRight, Zap, ChevronLeft, Sliders } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function CareerTwinPage() {
  const { slug } = useParams<{ slug: string }>();
  const [twin, setTwin] = useState<any>(null);
  const [whatIf, setWhatIf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [constraints, setConstraints] = useState({
    daily_minutes: 60,
    no_laptop: false,
    no_internet: false,
    prefer_vocational: false,
  });

  useEffect(() => {
    api.get(`/ai/career-twin/${slug}`)
      .then(r => setTwin(r.data))
      .finally(() => setLoading(false));
  }, [slug]);

  const runWhatIf = async () => {
    setWhatIfLoading(true);
    try {
      const res = await api.post('/ai/what-if', {
        career_slug: slug,
        constraints,
      });
      setWhatIf(res.data);
    } finally {
      setWhatIfLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!twin) return <div className="p-8 text-slate-400">Career twin not found.</div>;

  const hasSkills = twin.skills_you_have || [];
  const missingSkills = twin.skills_to_develop || [];

  const barData = [
    { name: 'Have', value: hasSkills.length, fill: '#14b8a6' },
    { name: 'Missing', value: missingSkills.length, fill: '#f97316' },
    { name: 'Optional', value: twin.optional_skills?.length || 0, fill: '#6366f1' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <Link to={`/careers/${slug}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to {twin.career_title}
      </Link>

      <div className="flex items-center gap-2 text-teal-400 text-sm font-medium mb-2">
        <TrendingUp className="w-4 h-4" /> Career Twin
      </div>
      <h1 className="font-display font-bold text-3xl mb-1">{twin.career_title}</h1>
      <p className="text-slate-400 text-sm mb-6">Your current capabilities vs. career requirements</p>

      {/* Readiness overview */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Skill Readiness</h2>
          <span className="text-2xl font-bold gradient-text">{twin.readiness_percentage}%</span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all"
            style={{ width: `${twin.readiness_percentage}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mb-4">{twin.note}</div>

        {/* Bar chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={60} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Skills You Have ({hasSkills.length})
          </h3>
          <div className="space-y-1.5">
            {hasSkills.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-slate-300">{s.name}</span>
              </div>
            ))}
            {hasSkills.length === 0 && <p className="text-xs text-slate-600">None yet — complete your profile</p>}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Skills to Develop ({missingSkills.length})
          </h3>
          <div className="space-y-1.5">
            {missingSkills.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
                <XCircle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                <span className="text-slate-300">{s.name}</span>
              </div>
            ))}
            {missingSkills.length === 0 && <p className="text-xs text-green-400">🎉 You have all required skills!</p>}
          </div>
        </div>
      </div>

      {/* Next step */}
      {twin.next_step && (
        <div className="glass-card rounded-xl p-5 mb-5 border border-sky-500/20 bg-sky-500/5">
          <h3 className="font-semibold text-sky-400 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Your Next Step
          </h3>
          <div className="text-white font-medium mb-1">{twin.next_step.title}</div>
          <div className="text-xs text-slate-400 mb-1 capitalize">{twin.next_step.phase} phase · {twin.next_step.estimated_weeks} weeks</div>
          {twin.next_step.practical_task && (
            <div className="text-xs text-slate-300 mt-2 p-2 bg-white/5 rounded-lg">{twin.next_step.practical_task}</div>
          )}
          <Link to={`/careers/${slug}/roadmap`}
            className="mt-3 flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors">
            View full roadmap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Estimated timeline */}
      <div className="glass-card rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Estimated time to ready</div>
            <div className="text-xs text-slate-500 mt-0.5">Based on {twin.daily_study_minutes} min/day study</div>
          </div>
          <div className="text-2xl font-bold gradient-text">{twin.estimated_weeks_to_ready}w</div>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="glass-card rounded-2xl p-5 mb-5">
        <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-400" /> What If...?
        </h2>
        <p className="text-xs text-slate-500 mb-4">Simulate how different constraints change your pathway.</p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Daily study time: {constraints.daily_minutes} minutes</label>
            <input
              type="range" min="15" max="180" step="15"
              value={constraints.daily_minutes}
              onChange={e => setConstraints(c => ({ ...c, daily_minutes: parseInt(e.target.value) }))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-0.5">
              <span>15 min</span><span>1 hour</span><span>3 hours</span>
            </div>
          </div>

          {[
            { key: 'no_laptop', label: "I don't have a laptop" },
            { key: 'no_internet', label: "I don't have reliable internet" },
            { key: 'prefer_vocational', label: "I prefer a vocational career" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/8">
              <span className="text-sm text-slate-300">{label}</span>
              <div
                onClick={() => setConstraints(c => ({ ...c, [key]: !(c as any)[key] }))}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${(constraints as any)[key] ? 'bg-teal-500' : 'bg-white/20'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${(constraints as any)[key] ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          ))}
        </div>

        <button onClick={runWhatIf} disabled={whatIfLoading}
          className="w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {whatIfLoading ? (
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Sliders className="w-4 h-4" /> Recalculate Pathway</>
          )}
        </button>

        {whatIf && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Original</div>
                <div className="text-lg font-bold text-white">{whatIf.original_weeks}w</div>
              </div>
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-center">
                <div className="text-xs text-sky-400 mb-1">With your constraints</div>
                <div className="text-lg font-bold text-sky-400">{whatIf.adjusted_weeks}w</div>
              </div>
            </div>
            {whatIf.adaptations.map((a: string, i: number) => (
              <div key={i} className="text-xs text-slate-400 flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                <span className="text-teal-400 flex-shrink-0">→</span> {a}
              </div>
            ))}
            {whatIf.alternative_pathway && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="text-xs text-violet-400 font-medium mb-1">💡 Alternative suggested</div>
                <div className="text-sm text-white mb-0.5">{whatIf.alternative_pathway.title}</div>
                <div className="text-xs text-slate-400">{whatIf.alternative_pathway.reason}</div>
                <Link to={`/careers/${whatIf.alternative_pathway.slug}`}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Explore alternative <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
            <p className="text-xs text-slate-600">{whatIf.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
