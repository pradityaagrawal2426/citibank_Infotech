import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Award, CheckCircle, AlertTriangle, Plus, ExternalLink } from 'lucide-react';

const EVIDENCE_TYPES = [
  { value: 'self_reported', label: 'Self-reported', desc: 'I have this skill' },
  { value: 'project', label: 'Project', desc: 'I completed a practical task' },
  { value: 'assessment', label: 'Assessment', desc: 'I passed a test or quiz' },
  { value: 'certificate', label: 'Certificate', desc: 'I have a certificate' },
];

const VERIFICATION_COLORS: Record<string, string> = {
  verified: 'text-green-400 bg-green-500/10 border-green-500/20',
  pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  unverified: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  flagged: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function SkillPassportPage() {
  const [passport, setPassport] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ skill_id: '', evidence_type: 'self_reported', task_description: '', submission_url: '', submission_notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [passRes, skillsRes] = await Promise.all([
        api.get('/students/skill-passport'),
        api.get('/careers/').then(r => {
          // Collect all skill names from careers to populate skill selection
          return { data: [] };
        }),
      ]);
      setPassport(passRes.data);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all skills separately
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/ai/career-twin/software-developer');
        const allSkills = [
          ...(res.data.skills_you_have || []),
          ...(res.data.skills_to_develop || []),
          ...(res.data.optional_skills || []),
        ];
        setSkills(allSkills);
      } catch {
        // fallback: empty
      }
    };
    fetchSkills();
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skill_id) { toast.error('Select a skill'); return; }
    setSubmitting(true);
    try {
      await api.post('/students/skill-evidence', {
        skill_id: parseInt(form.skill_id),
        evidence_type: form.evidence_type,
        task_description: form.task_description,
        submission_url: form.submission_url,
        submission_notes: form.submission_notes,
      });
      toast.success('Skill evidence recorded!');
      setShowAdd(false);
      setForm({ skill_id: '', evidence_type: 'self_reported', task_description: '', submission_url: '', submission_notes: '' });
      load();
    } catch {
      toast.error('Failed to record evidence');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
          <Award className="w-4 h-4" /> Skill Passport
        </div>
        <h1 className="font-display font-bold text-3xl">My Skills Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Document your abilities with evidence. Distinguish self-reported skills from verified ones.
        </p>
      </div>

      {/* Stats */}
      {passport && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-sky-600">{passport.total_skills}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Total skills</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-emerald-600">{passport.verified_skills}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Verified</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-xs">
            <div className="text-2xl font-black text-amber-600">{passport.self_reported}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">Self-reported</div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          This passport tracks progress and verified skill proofs. Self-reported skills are distinguished from verified ones for complete transparency.
        </div>
      </div>

      {/* Add evidence button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-gray-900">Evidence Records</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" /> Add Evidence
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 mb-5 border border-gray-200 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Record Skill Evidence</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Skill ID</label>
              <input
                type="number"
                placeholder="Skill ID (e.g. 1)"
                value={form.skill_id}
                onChange={e => setForm(f => ({ ...f, skill_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Evidence type</label>
              <div className="grid grid-cols-2 gap-2">
                {EVIDENCE_TYPES.map(et => (
                  <button key={et.value} type="button"
                    onClick={() => setForm(f => ({ ...f, evidence_type: et.value }))}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${form.evidence_type === et.value ? 'bg-sky-50 border-sky-400 text-sky-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    <div>{et.label}</div>
                    <div className="text-gray-500 text-[11px] font-normal mt-0.5">{et.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Task description</label>
              <textarea value={form.task_description}
                onChange={e => setForm(f => ({ ...f, task_description: e.target.value }))}
                placeholder="Describe what you did to demonstrate this skill"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none" rows={2} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Submission link</label>
              <input type="url" value={form.submission_url}
                onChange={e => setForm(f => ({ ...f, submission_url: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs disabled:opacity-50">
                {submitting ? '...' : 'Record Evidence'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Evidence list */}
      {passport && passport.evidences.length > 0 ? (
        <div className="space-y-3">
          {passport.evidences.map((ev: any) => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{ev.skill_name}</div>
                  <div className="text-xs text-gray-500 capitalize">{ev.skill_category}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-semibold ${VERIFICATION_COLORS[ev.verification_status] || VERIFICATION_COLORS.unverified}`}>
                    {ev.verification_status}
                  </span>
                  <span className="text-[11px] text-gray-500 capitalize">{ev.evidence_type.replace('_', ' ')}</span>
                </div>
              </div>
              {ev.task_description && <p className="text-xs text-gray-600 mb-2">{ev.task_description}</p>}
              {ev.submission_url && (
                <a href={ev.submission_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-sky-600 hover:underline font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" /> View submission proof
                </a>
              )}
              {ev.reviewer_feedback && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs text-emerald-800 font-bold mb-0.5">Reviewer feedback</div>
                  <div className="text-xs text-emerald-700">{ev.reviewer_feedback}</div>
                </div>
              )}
              {ev.completed_at && (
                <div className="text-[10px] text-gray-400 mt-2">Verified on {new Date(ev.completed_at).toLocaleDateString('en-IN')}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-xs">
          No skill proofs uploaded yet. Complete micro-gigs to automatically earn verified proofs!
        </div>
      )}
    </div>
  );
}
