import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import {
  Bell, ChevronRight, CheckCircle2, QrCode, ArrowRight,
  Sparkles, ExternalLink, ShieldCheck, Coins, Award
} from 'lucide-react';
import ChaupalSyncModal from '../components/ChaupalSyncModal';

// 1. Atom Icon (Physics / Cyan & Magenta)
function AtomIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#00b4d8" strokeWidth="3" transform="rotate(-30 32 32)" />
      <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#0077b6" strokeWidth="3" transform="rotate(30 32 32)" />
      <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#e0218a" strokeWidth="3" transform="rotate(90 32 32)" />
      <circle cx="32" cy="32" r="5" fill="#e0218a" />
      <circle cx="14" cy="22" r="3" fill="#00b4d8" />
      <circle cx="50" cy="42" r="3" fill="#00b4d8" />
    </svg>
  );
}

// 2. Newton's Cradle Pendulum Icon (Cyan top bar with hanging maroon balls)
function PendulumIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="5" rx="2.5" fill="#00b4d8" />
      <path d="M18 13L14 36" stroke="#48cae4" strokeWidth="2" />
      <path d="M25 13L25 36" stroke="#48cae4" strokeWidth="2" />
      <path d="M32 13L32 36" stroke="#48cae4" strokeWidth="2" />
      <path d="M39 13L39 36" stroke="#48cae4" strokeWidth="2" />
      <path d="M46 13L52 32" stroke="#48cae4" strokeWidth="2" />
      <circle cx="13" cy="38" r="5.5" fill="#ad1457" />
      <circle cx="25" cy="40" r="5.5" fill="#ad1457" />
      <circle cx="32" cy="40" r="5.5" fill="#ad1457" />
      <circle cx="39" cy="40" r="5.5" fill="#ad1457" />
      <circle cx="54" cy="35" r="5.5" fill="#ad1457" />
    </svg>
  );
}

// 3. Chemistry Erlenmeyer Flask Icon (Cyan body with purple fluid)
function FlaskIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 8H36V18L49 46C51 50 48 54 44 54H20C16 54 13 50 15 46L28 18V8Z" fill="#00b4d8" />
      <path d="M20 44L23 38C26 40 31 36 34 39C37 42 41 38 44 41L47 44C48 47 46 52 42 52H22C18 52 16 47 20 44Z" fill="#ad1457" />
      <circle cx="28" cy="46" r="2" fill="white" />
      <circle cx="35" cy="43" r="1.5" fill="white" />
      <rect x="26" y="6" width="12" height="3" rx="1.5" fill="#0077b6" />
    </svg>
  );
}

// 4. Test Tubes & Rack Icon (Cyan rack with maroon tubes)
function TestTubesIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="10" width="40" height="4" rx="2" fill="#00b4d8" />
      <rect x="12" y="44" width="40" height="4" rx="2" fill="#00b4d8" />
      <path d="M14 10V46M50 10V46" stroke="#00b4d8" strokeWidth="3" strokeLinecap="round" />
      {/* Tube 1 */}
      <rect x="20" y="14" width="8" height="26" rx="4" fill="#ad1457" />
      <rect x="22" y="12" width="4" height="2" fill="#0077b6" />
      {/* Tube 2 */}
      <rect x="36" y="14" width="8" height="26" rx="4" fill="#ad1457" />
      <rect x="38" y="12" width="4" height="2" fill="#0077b6" />
    </svg>
  );
}

// 5. Magnet Icon (Horseshoe with cyan & magenta poles)
function MagnetIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 16V28C16 36.8366 23.1634 44 32 44C40.8366 44 48 36.8366 48 28V16" stroke="url(#paint0_linear)" strokeWidth="9" strokeLinecap="round" />
      <rect x="11.5" y="12" width="9" height="7" rx="1.5" fill="#00b4d8" />
      <rect x="43.5" y="12" width="9" height="7" rx="1.5" fill="#ad1457" />
      {/* Sparkles */}
      <path d="M48 6L50 10L54 12L50 14L48 18L46 14L42 12L46 10L48 6Z" fill="#00b4d8" />
      <defs>
        <linearGradient id="paint0_linear" x1="16" y1="28" x2="48" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00b4d8" />
          <stop offset="1" stopColor="#ad1457" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 6. Book / Notebook Icon (Magenta with white page markings)
function BookDocIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="10" width="28" height="42" rx="4" fill="#ad1457" />
      <rect x="22" y="16" width="20" height="4" rx="2" fill="white" />
      <rect x="22" y="24" width="16" height="3" rx="1.5" fill="white" opacity="0.8" />
      <rect x="22" y="30" width="14" height="3" rx="1.5" fill="white" opacity="0.8" />
      <path d="M34 10V22L38 19L42 22V10H34Z" fill="#00b4d8" />
    </svg>
  );
}

// 7. Circular Logo Emblem (RaahSetu Monogram inside double circle)
function RaahSetuEmblemIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#111827" strokeWidth="2" />
      <circle cx="32" cy="32" r="25" stroke="#111827" strokeWidth="1" strokeDasharray="2 2" />
      <text x="32" y="38" textAnchor="middle" fill="#111827" fontSize="19" fontFamily="serif" fontWeight="bold">
        RS
      </text>
    </svg>
  );
}

// 8. Chaupal QR / Lesson Sync Icon
function ChaupalQrIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="14" height="14" rx="2" stroke="#00b4d8" strokeWidth="3" />
      <rect x="18" y="18" width="6" height="6" fill="#00b4d8" />
      <rect x="36" y="14" width="14" height="14" rx="2" stroke="#ad1457" strokeWidth="3" />
      <rect x="40" y="18" width="6" height="6" fill="#ad1457" />
      <rect x="14" y="36" width="14" height="14" rx="2" stroke="#ad1457" strokeWidth="3" />
      <rect x="18" y="40" width="6" height="6" fill="#ad1457" />
      <rect x="36" y="36" width="6" height="6" fill="#00b4d8" />
      <rect x="44" y="36" width="6" height="6" fill="#ad1457" />
      <rect x="36" y="44" width="6" height="6" fill="#ad1457" />
      <rect x="44" y="44" width="6" height="6" fill="#00b4d8" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const outletCtx = (useOutletContext<{ personaName?: string }>() as any) || {};
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [chaupalOpen, setChaupalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayName = outletCtx.personaName === 'priya' 
    ? (profile?.full_name?.split(' ')[0] || 'Priya')
    : 'jasmeet';

  useEffect(() => {
    Promise.all([
      api.get('/students/profile').catch(() => null),
      api.get('/micro-gigs/wallet').catch(() => null),
    ]).then(([profRes, walRes]) => {
      if (profRes) setProfile(profRes.data);
      if (walRes) setWallet(walRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // 7 Exact items + 1 empty cell matching the user's uploaded screenshot pixel-for-pixel!
  const items = [
    {
      id: 'demand',
      icon: AtomIcon,
      line1: 'XI PHYSICS IIT-JEE MAINS',
      line2: '& NEET',
      sublabel: 'Gaon Demand Ledger',
      path: '/demand-ledger',
    },
    {
      id: 'gigs',
      icon: PendulumIcon,
      line1: 'XII PHYSICS IIT-JEE MAINS',
      line2: '& NEET',
      sublabel: 'Kamao-Seekho Micro-Gigs',
      path: '/micro-gigs',
    },
    {
      id: 'passport',
      icon: FlaskIcon,
      line1: 'XI CHEMISTRY IIT-JEE',
      line2: 'MAINS & NEET',
      sublabel: 'Verified Skill Passport',
      path: '/passport',
    },
    {
      id: 'bridge',
      icon: TestTubesIcon,
      line1: 'XII CHEMISTRY IIT-JEE',
      line2: 'MAINS & NEET',
      sublabel: '₹8k Zero-Debt Relocation Bridge',
      path: '/bridge-funding',
    },
    {
      id: 'kavach',
      icon: MagnetIcon,
      line1: 'XI PHYSICS ALPHA',
      line2: '',
      sublabel: 'Pravas Kavach Safety Plan',
      path: '/pravas-kavach',
    },
    {
      id: 'prep',
      icon: BookDocIcon,
      line1: 'Chapterwise Previous Year',
      line2: 'Paper for BOARD/JEE/NEET',
      sublabel: 'Prep Dojo & Mock Saakshatkar',
      path: '/prep-dojo',
    },
    {
      id: 'emblem',
      icon: RaahSetuEmblemIcon,
      line1: 'Chapterwise Formula Sheet',
      line2: '-#Best',
      sublabel: 'Tata Power Apprenticeship Offer',
      path: '/opportunities/1',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile App Container (Centered max-w-md on desktop, full width on mobile) */}
      <div className="w-full max-w-md flex flex-col relative pb-6">
        
        {/* Top App Header with Centered RaahSetu Emblem & Right Notification Bell */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Centered RaahSetu Monogram Emblem */}
          <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-serif font-black text-sm border-2 border-white/80 shadow-md">
            RS
          </div>

          {/* Bell Icon on the Top Right */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white relative hover:opacity-90 transition-opacity">
            <Bell className="w-6 h-6 fill-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-1 border-2 border-white" />
          </button>
        </div>

        {/* Greeting Typography (Exact Match to Screenshot) */}
        <div className="text-center pt-2 pb-6 px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Hi ! {displayName}
          </h1>
          <p className="text-base sm:text-lg font-bold text-white/95 mt-1 tracking-tight drop-shadow-sm">
            What would you like to learn today?
          </p>
        </div>

        {/* THE BIG WHITE FLOATING CARD WITH 2-COLUMN GRID (Pixel-Faithful to Screenshot) */}
        <div className="px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
              {items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="p-4 py-5 flex flex-col items-center justify-center text-center hover:bg-sky-50/50 transition-colors cursor-pointer min-h-[135px] group"
                    title={item.sublabel}
                  >
                    {/* Centered Illustrated Icon */}
                    <div className="mb-2.5 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                      <IconComponent className="w-11 h-11" />
                    </div>

                    {/* Bold All-Caps Text (Exact match to screenshot typography) */}
                    <div className="font-extrabold text-[11px] text-gray-800 leading-[1.3] tracking-tight uppercase max-w-[155px]">
                      <div>{item.line1}</div>
                      {item.line2 && <div>{item.line2}</div>}
                    </div>

                    {/* Subtle Subtitle Indicator */}
                    <div className="text-[9px] font-semibold text-sky-600/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.sublabel}
                    </div>
                  </Link>
                );
              })}

              {/* 8th Cell: EMPTY (Exact Match to Screenshot!) */}
              <div className="p-4 py-5 min-h-[135px] bg-white" />
            </div>
          </div>
        </div>

        {/* "Resume Preparation" Section (Exact words & layout as in Screenshot) */}
        <div className="px-4 mt-6">
          <h2 className="text-sm font-extrabold text-gray-700 tracking-tight px-1 mb-2.5">
            Resume Preparation
          </h2>

          {/* Clean White Card below */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  Target Apprenticeship
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 mt-1">
                  Tata Power Solar PV Technician (Pune)
                </h3>
                <p className="text-xs text-gray-500">Stipend: ₹14,500/mo · Zero-Debt CSR Grant Approved</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Ready
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-semibold block text-[10px]">Simulated Wallet:</span>
                <span className="font-extrabold text-gray-900 text-sm">₹{wallet?.balance_inr ?? 1200}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-semibold block text-[10px]">Pehla Kadam Grant:</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹8,000 Approved</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/pravas-kavach"
                className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs text-center shadow-xs transition-colors"
              >
                Pravas Safety Plan
              </Link>
              <Link
                to="/bridge-funding"
                className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs text-center transition-colors"
              >
                Bridge Decision
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Chaupal Sync Modal */}
      <ChaupalSyncModal
        isOpen={chaupalOpen}
        onClose={() => setChaupalOpen(false)}
      />
    </div>
  );
}
