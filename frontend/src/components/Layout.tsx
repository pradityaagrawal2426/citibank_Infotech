import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Home, Compass, Award, Mic, Users, LogOut,
  ChevronRight, Menu, X, Sparkles, Briefcase,
  MapPin, Coins, ShieldCheck, Dumbbell, Globe,
  QrCode, RotateCcw, ArrowRight, Bell, Smartphone,
  Monitor, CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import api from '../lib/api';
import ChaupalSyncModal from './ChaupalSyncModal';

// 5 Custom SVGs matching mobile bottom navigation bar
function NavHomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? "#e91e63" : "none"} stroke={active ? "#e91e63" : "#757575"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" fill={active ? "#ffffff" : "none"} stroke={active ? "#e91e63" : "#757575"} />
    </svg>
  );
}

function NavTestIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? "#e91e63" : "#757575"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function NavBatchesIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? "#e91e63" : "#757575"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function NavFeedsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? "#e91e63" : "#757575"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

function NavOffersIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={active ? "#e91e63" : "#757575"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chaupalOpen, setChaupalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  // Default to phone view on desktop so the user sees the exact screenshot layout!
  const [deviceMode, setDeviceMode] = useState<'phone' | 'desktop'>('phone');
  const [personaName, setPersonaName] = useState<'jasmeet' | 'priya'>('jasmeet');

  // 5 mobile tabs: Home, Test, Batches, Feeds, Offers
  const mobileNav = [
    { path: '/dashboard', icon: NavHomeIcon, label: 'Home' },
    { path: '/demand-ledger', icon: NavTestIcon, label: 'Test' },
    { path: '/micro-gigs', icon: NavBatchesIcon, label: 'Batches' },
    { path: '/bridge-funding', icon: NavFeedsIcon, label: 'Feeds' },
    { path: '/passport', icon: NavOffersIcon, label: 'Offers' },
  ];

  const studentNav = [
    { path: '/dashboard', icon: Home, label: t('home'), badge: null },
    { path: '/demand-ledger', icon: MapPin, label: t('demandLedger'), badge: 'Hot' },
    { path: '/careers', icon: Compass, label: t('discover'), badge: null },
    { path: '/micro-gigs', icon: Coins, label: t('microGigs'), badge: 'Earn' },
    { path: '/opportunities', icon: Briefcase, label: t('opportunities'), badge: null },
    { path: '/passport', icon: Award, label: t('mySkills'), badge: null },
    { path: '/bridge-funding', icon: ShieldCheck, label: t('bridgeFunding'), badge: '₹8k' },
    { path: '/pravas-kavach', icon: ShieldCheck, label: t('pravasKavach'), badge: null },
    { path: '/prep-dojo', icon: Dumbbell, label: t('prepDojo'), badge: null },
    { path: '/voice', icon: Mic, label: t('askMentor'), badge: null },
  ];

  const facilitatorNav = [
    { path: '/facilitator', icon: Users, label: t('facilitator'), badge: null },
    { path: '/demand-ledger', icon: MapPin, label: t('demandLedger'), badge: null },
    { path: '/bridge-funding', icon: ShieldCheck, label: 'Bridge Approvals', badge: null },
  ];

  const nav = user?.role === 'facilitator' || user?.role === 'admin' ? facilitatorNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset demo state to Priya\'s initial story?')) return;
    setResetting(true);
    try {
      const res = await api.post('/demo/reset');
      toast.success(res.data.message || 'Demo data successfully reset');
      navigate('/dashboard');
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      toast.error('Failed to reset demo');
    } finally {
      setResetting(false);
    }
  };

  const acts = [
    { id: 1, title: 'Act 1: Demand', path: '/demand-ledger', desc: 'Village needs shift careers' },
    { id: 2, title: 'Act 2: Earn & Prove', path: '/micro-gigs', desc: 'Micro-gigs & wallet' },
    { id: 3, title: 'Act 3: ₹8k Barrier', path: '/bridge-funding', desc: 'Relocation gap grant' },
    { id: 4, title: 'Act 4: Transition Safe', path: '/pravas-kavach', desc: 'Hostel, buddy & joining' },
  ];

  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-gray-900 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Demo Bar for Hackathon Judges & View Switching (Desktop only) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-[#1e293b] text-white border-b border-slate-700/60 text-xs shadow-md z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-sm tracking-tight text-white hover:text-sky-400 transition-colors">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>RaahSetu</span>
            <span className="text-[10px] font-normal text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
              Rural Career Bridge
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 pl-2 pr-1 font-semibold">Persona:</span>
            <button
              onClick={() => setPersonaName('jasmeet')}
              className={clsx(
                "px-2 py-1 rounded text-[11px] font-bold transition-all",
                personaName === 'jasmeet' ? "bg-sky-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              )}
            >
              jasmeet (Screenshot)
            </button>
            <button
              onClick={() => setPersonaName('priya')}
              className={clsx(
                "px-2 py-1 rounded text-[11px] font-bold transition-all",
                personaName === 'priya' ? "bg-sky-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              )}
            >
              Priya Sharma (Citi Demo)
            </button>
          </div>
        </div>

        {/* 4 Acts Stepper */}
        <div className="flex items-center gap-1.5">
          {acts.map((act) => {
            const isCurrent = location.pathname === act.path;
            return (
              <Link
                key={act.id}
                to={act.path}
                className={clsx(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border",
                  isCurrent
                    ? "bg-rose-600 text-white border-rose-500 shadow-xs"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                )}
                title={act.desc}
              >
                {act.title}
              </Link>
            );
          })}
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setDeviceMode('phone')}
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all",
                deviceMode === 'phone' ? "bg-sky-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              )}
              title="Mobile Device Frame matching user's reference image"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all",
                deviceMode === 'desktop' ? "bg-sky-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              )}
              title="Wide Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>

          <button
            onClick={() => setChaupalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded-lg border border-slate-700 text-[11px] transition-colors"
            title="Chaupal Offline Sync"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Chaupal</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-red-900/40 text-red-400 font-bold rounded-lg border border-slate-700 text-[11px] transition-colors"
            title="Reset Demo"
          >
            <RotateCcw className={clsx("w-3 h-3", resetting && "animate-spin")} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex justify-center items-start w-full">
        
        {/* IF IN PHONE MODE ON DESKTOP: RENDER IN GORGEOUS MOBILE FRAME */}
        {deviceMode === 'phone' ? (
          <div className="w-full flex justify-center py-0 lg:py-6 px-0 lg:px-4">
            {/* Phone Device Shell */}
            <div className="w-full max-w-[420px] min-h-screen lg:min-h-[840px] bg-gradient-to-b from-[#1877d2] via-[#228be6] to-[#f4f7fa] lg:rounded-[40px] lg:border-[10px] lg:border-[#1e293b] shadow-2xl relative flex flex-col overflow-hidden pb-16">
              
              {/* Phone Speaker Notch (Desktop decorative only) */}
              <div className="hidden lg:flex justify-center pt-2 pb-1 z-30">
                <div className="w-24 h-4 bg-[#1e293b] rounded-full flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-600 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                </div>
              </div>

              {/* Page Content Inside Mobile Frame */}
              <div className="flex-1 overflow-y-auto">
                <Outlet context={{ personaName }} />
              </div>

              {/* Exact 5-Tab Bottom Bar Docked Inside the Phone Shell */}
              <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/90 shadow-lg flex items-center justify-around py-1.5">
                {mobileNav.map(({ path, icon: Icon, label }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={clsx(
                        "flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[11px] transition-all",
                        active ? "text-[#e91e63] font-bold" : "text-[#757575] font-semibold hover:text-gray-900"
                      )}
                    >
                      <Icon active={active} />
                      <span className={active ? "text-[#e91e63]" : "text-[#757575]"}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

            </div>
          </div>
        ) : (
          /* EXPANDED DESKTOP DASHBOARD MODE */
          <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
            {/* Sidebar — desktop */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-11 bottom-0 z-40 shadow-xs">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <span className="font-display font-bold text-gray-900 text-base">RaahSetu</span>
                </Link>
                <button
                  onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                  className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {lang === 'en' ? 'हिंदी' : 'EN'}
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {nav.map(({ path, icon: Icon, label, badge }) => {
                  const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path + '/'));
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                        active
                          ? 'bg-sky-50 text-sky-800 font-bold border-l-4 border-sky-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                    >
                      <Icon className={clsx("w-4 h-4", active ? "text-sky-600" : "text-gray-500")} />
                      <span>{label}</span>
                      {badge && (
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {/* Desktop Full-width Outlet */}
            <main className="flex-1 lg:ml-64 p-6 bg-[#f8fafc] min-h-screen">
              <Outlet context={{ personaName }} />
            </main>
          </div>
        )}

      </div>

      {/* Chaupal Sync Modal */}
      <ChaupalSyncModal
        isOpen={chaupalOpen}
        onClose={() => setChaupalOpen(false)}
      />
    </div>
  );
}
