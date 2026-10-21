import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CareerDiscoveryPage from './pages/CareerDiscoveryPage';
import CareerDetailPage from './pages/CareerDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import SkillPassportPage from './pages/SkillPassportPage';
import CareerTwinPage from './pages/CareerTwinPage';
import VoiceMentorPage from './pages/VoiceMentorPage';
import FacilitatorDashboardPage from './pages/FacilitatorDashboardPage';
import GaonDemandLedgerPage from './pages/GaonDemandLedgerPage';
import MicroGigsPage from './pages/MicroGigsPage';
import BridgeFundingPage from './pages/BridgeFundingPage';
import PravasKavachPage from './pages/PravasKavachPage';
import PrepDojoPage from './pages/PrepDojoPage';
import Layout from './components/Layout';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(148,163,184,0.2)',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/onboarding" element={
                <PrivateRoute><OnboardingPage /></PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute><DashboardPage /></PrivateRoute>
              } />
              <Route path="/demand-ledger" element={
                <PrivateRoute><GaonDemandLedgerPage /></PrivateRoute>
              } />
              <Route path="/careers" element={
                <PrivateRoute><CareerDiscoveryPage /></PrivateRoute>
              } />
              <Route path="/careers/:slug" element={
                <PrivateRoute><CareerDetailPage /></PrivateRoute>
              } />
              <Route path="/careers/:slug/roadmap" element={
                <PrivateRoute><RoadmapPage /></PrivateRoute>
              } />
              <Route path="/careers/:slug/twin" element={
                <PrivateRoute><CareerTwinPage /></PrivateRoute>
              } />
              <Route path="/micro-gigs" element={
                <PrivateRoute><MicroGigsPage /></PrivateRoute>
              } />
              <Route path="/opportunities" element={
                <PrivateRoute><OpportunitiesPage /></PrivateRoute>
              } />
              <Route path="/opportunities/:id" element={
                <PrivateRoute><OpportunityDetailPage /></PrivateRoute>
              } />
              <Route path="/passport" element={
                <PrivateRoute><SkillPassportPage /></PrivateRoute>
              } />
              <Route path="/bridge-funding" element={
                <PrivateRoute><BridgeFundingPage /></PrivateRoute>
              } />
              <Route path="/pravas-kavach" element={
                <PrivateRoute><PravasKavachPage /></PrivateRoute>
              } />
              <Route path="/prep-dojo" element={
                <PrivateRoute><PrepDojoPage /></PrivateRoute>
              } />
              <Route path="/voice" element={
                <PrivateRoute><VoiceMentorPage /></PrivateRoute>
              } />
              <Route path="/facilitator" element={
                <PrivateRoute roles={['facilitator', 'admin']}><FacilitatorDashboardPage /></PrivateRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
