import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  BookOpen, CheckCircle, Circle, Clock, ChevronDown, ChevronUp,
  ChevronLeft, Zap, TrendingUp, Trophy
} from 'lucide-react';
import clsx from 'clsx';

const PHASE_COLORS: Record<string, string> = {
  beginner: 'from-green-500 to-emerald-600',
  intermediate: 'from-sky-500 to-blue-600',
  advanced: 'from-violet-500 to-purple-600',
};

const PHASE_LABELS: Record<string, string> = {
  beginner: '🌱 Beginner',
  intermediate: '🚀 Intermediate',
  advanced: '🏆 Advanced',
};

export default function RoadmapPage() {
  const { slug } = useParams<{ slug: string }>();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    api.get(`/roadmaps/career/${slug}`)
      .then(r => setRoadmap(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [slug]);

  const toggleComplete = async (milestone: any) => {
    setUpdatingId(milestone.id);
    try {
      await api.post('/students/progress', {
        milestone_id: milestone.id,
        career_id: roadmap.career_id,
        is_complete: !milestone.is_complete,
      });
      toast.success(milestone.is_complete ? 'Marked incomplete' : '🎉 Milestone complete!');
      load();
    } catch {
      toast.error('Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!roadmap) return <div className="p-8 text-slate-400">Roadmap not found.</div>;

  const allMilestones = [
    ...(roadmap.phases.beginner || []),
    ...(roadmap.phases.intermediate || []),
    ...(roadmap.phases.advanced || []),
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <Link to={`/careers/${slug}`} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-xs font-bold mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to {roadmap.career_title}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-sky-600 text-xs font-bold mb-2">
          <BookOpen className="w-4 h-4" /> Learning Roadmap
        </div>
        <h1 className="font-bold text-2xl text-gray-900 mb-4">{roadmap.career_title}</h1>

        {/* Overall progress */}
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-gray-600">Overall progress</span>
          <span className="text-sky-600">{roadmap.completed_milestones}/{roadmap.total_milestones} milestones</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 border border-gray-200">
          <div
            className="h-full bg-sky-600 rounded-full transition-all duration-1000"
            style={{ width: `${roadmap.completion_rate}%` }}
          />
        </div>

        <div className="flex gap-3 text-center">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-lg font-black text-sky-600">{roadmap.completion_rate}%</div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">Complete</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-lg font-black text-gray-900">{roadmap.estimated_total_weeks}w</div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">Est. total time</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-lg font-black text-gray-900">{roadmap.total_milestones}</div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">Milestones</div>
          </div>
        </div>
      </div>

      {/* Phases */}
      {(['beginner', 'intermediate', 'advanced'] as const).map(phase => {
        const milestones = roadmap.phases[phase] || [];
        if (milestones.length === 0) return null;

        return (
          <div key={phase} className="mb-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r ${PHASE_COLORS[phase]} text-white text-xs font-bold mb-4 shadow-2xs`}>
              {PHASE_LABELS[phase]}
            </div>

            <div className="space-y-3">
              {milestones.map((m: any, idx: number) => (
                <div key={m.id} className={clsx(
                  'bg-white rounded-2xl border transition-all shadow-xs',
                  m.is_complete ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 hover:border-gray-300'
                )}>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); toggleComplete(m); }}
                      disabled={updatingId === m.id}
                      className="shrink-0"
                    >
                      {updatingId === m.id ? (
                        <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      ) : m.is_complete ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-semibold">#{idx + 1}</span>
                        <h3 className={clsx('font-bold text-sm', m.is_complete ? 'text-emerald-700 line-through opacity-80' : 'text-gray-900')}>
                          {m.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> {m.estimated_weeks}w
                        </span>
                        {m.skills_covered.length > 0 && (
                          <div className="flex gap-1">
                            {m.skills_covered.slice(0, 2).map((s: string) => (
                              <span key={s} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {expanded === m.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  {expanded === m.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{m.description}</p>
                      {m.practical_task && (
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-3">
                          <div className="text-xs font-bold text-sky-800 mb-1 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-sky-600" /> Practical Task
                          </div>
                          <p className="text-xs text-sky-900">{m.practical_task}</p>
                        </div>
                      )}
                      {!m.is_complete && (
                        <button
                          onClick={() => toggleComplete(m)}
                          disabled={updatingId === m.id}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark as complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {roadmap.completion_rate >= 100 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-amber-300 shadow-sm">
          <Trophy className="w-12 h-12 mx-auto text-amber-500 mb-3" />
          <h3 className="font-bold text-xl text-gray-900 mb-2">Roadmap Complete! 🎉</h3>
          <p className="text-xs text-gray-600">You've finished all milestones. Time to apply for opportunities!</p>
          <Link to="/opportunities" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs">
            View Opportunities <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
