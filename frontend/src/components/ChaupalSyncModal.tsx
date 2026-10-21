import { useState } from 'react';
import { X, QrCode, Smartphone, WifiOff, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChaupalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChaupalSyncModal({ isOpen, onClose }: ChaupalSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'receive' | 'quiz'>('share');
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  if (!isOpen) return null;

  const lessonPacket = {
    packet_id: "CHAUPAL-SOLAR-04",
    title: "Solar DC Isolation & Multimeter Zero-Energy Verification",
    size: "1.4 KB",
    offline_hash: "SHA256:7e9a3b...c41",
    modules: ["DC Switch Isolation Protocol", "Earthing Pit Resistance Check", "PPE Class-0 Glove Rules"],
  };

  const handleCompleteQuiz = () => {
    if (quizAnswer === 'dc') {
      setIsSynced(true);
      toast.success('Offline verification recorded! Synced with local storage & server queue.');
    } else {
      toast.error('Incorrect. In high-voltage DC arrays, always isolate the DC switch first before touching terminals.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">Chaupal Sync</h3>
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Offline QR Packet
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Internet Peer Lesson Transfer for Rural Clusters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 my-4 p-1 bg-slate-900/60 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'share' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Share Packet (QR)
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'receive' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Receive & Load
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'quiz' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Complete Offline Quiz
          </button>
        </div>

        {/* Tab 1: Share QR */}
        {activeTab === 'share' && (
          <div className="text-center py-4">
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-sky-400/30">
              {/* Visual SVG QR Simulation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                <rect x="0" y="0" width="30" height="30" fill="black" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="black" />
                <rect x="70" y="0" width="30" height="30" fill="black" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="black" />
                <rect x="0" y="70" width="30" height="30" fill="black" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="black" />
                {/* Data blocks */}
                <rect x="35" y="10" width="10" height="10" fill="black" />
                <rect x="50" y="15" width="15" height="10" fill="black" />
                <rect x="35" y="35" width="30" height="30" fill="black" />
                <rect x="42" y="42" width="16" height="16" fill="white" />
                <rect x="70" y="45" width="10" height="20" fill="black" />
                <rect x="40" y="75" width="20" height="10" fill="black" />
                <rect x="70" y="75" width="25" height="20" fill="black" />
              </svg>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-left text-xs space-y-1">
              <div className="text-white font-medium">{lessonPacket.title}</div>
              <div className="text-slate-400">Packet Size: {lessonPacket.size} • Payload: Complete offline audio-guided text & diagrams</div>
              <div className="text-emerald-400 font-mono text-[11px]">{lessonPacket.offline_hash}</div>
            </div>

            <button
              onClick={() => setActiveTab('receive')}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              Simulate Peer Scanning Packet
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 2: Receive & Load */}
        {activeTab === 'receive' && (
          <div className="py-3 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-200">Packet Successfully Unpacked into Local Cache</div>
                <div className="text-slate-300 mt-1">
                  Transferred via 1-second single-frame optical scan. Can now be studied with zero Wi-Fi or cellular signal.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unpacked Lesson Modules</div>
              {lessonPacket.modules.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs text-white">
                  <span>{idx + 1}. {m}</span>
                  <span className="text-emerald-400 font-medium">Ready Offline</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              Take Practical Verification Quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 3: Offline Quiz */}
        {activeTab === 'quiz' && (
          <div className="py-3 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-xs text-sky-400 font-semibold mb-1">OFFLINE VERIFICATION QUESTION</div>
              <div className="text-sm font-medium text-white mb-3">
                Before opening a 600V DC rooftop solar combiner box in the field, what is the mandatory first step?
              </div>

              <div className="space-y-2 text-xs">
                <label
                  onClick={() => setQuizAnswer('water')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    quizAnswer === 'water' ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <input type="radio" name="offline_q" checked={quizAnswer === 'water'} readOnly />
                  <span>Wash the exterior solar panels with high-pressure hose</span>
                </label>

                <label
                  onClick={() => setQuizAnswer('dc')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    quizAnswer === 'dc' ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <input type="radio" name="offline_q" checked={quizAnswer === 'dc'} readOnly />
                  <span className="font-medium text-emerald-200">
                    Switch off the DC rotary isolator & verify zero voltage with an insulated multimeter
                  </span>
                </label>

                <label
                  onClick={() => setQuizAnswer('multimeter')}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    quizAnswer === 'multimeter' ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <input type="radio" name="offline_q" checked={quizAnswer === 'multimeter'} readOnly />
                  <span>Directly disconnect negative MC4 terminal bare-handed</span>
                </label>
              </div>
            </div>

            {isSynced ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Verified & Synced with Skill Passport!
                </div>
                <p>
                  Offline proof token <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">CHK-OFFLINE-9821</code> has been cryptographically signed.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs"
                >
                  Close & View Passport
                </button>
              </div>
            ) : (
              <button
                onClick={handleCompleteQuiz}
                disabled={!quizAnswer}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Submit Offline Proof
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
