import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AvatarMenu from './components/AvatarMenu';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Assessment     from './pages/Assessment';
import CareerAdvisor  from './pages/CareerAdvisor';
import MockInterview  from './pages/MockInterview';
import ProfilePage    from './pages/ProfilePage';
import SecurityPage   from './pages/SecurityPage';
import SettingsPage   from './pages/SettingsPage';

// ── Private route wrapper ──────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading"><i className="fa-solid fa-spinner fa-spin"></i></div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

// ── Nav link helper ────────────────────────────────────────────
const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

// ── App shell (sidebar + main) ─────────────────────────────────
function AppShell() {
  return (
    <div className="layout">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/assets/Project logo.png"
            alt="Career Compass"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>

        <nav className="nav-section nav">
          <h4>MAIN</h4>
          <NavLink to="/" className={link} end>
            <i className="fa-solid fa-chart-line"></i> Dashboard
          </NavLink>
          <NavLink to="/assessment" className={link}>
            <i className="fa-solid fa-clipboard-check"></i> Assessment
          </NavLink>
          <NavLink to="/career-advisor" className={link}>
            <i className="fa-solid fa-comments"></i> Career advisor
          </NavLink>
          <NavLink to="/mock-interview" className={link}>
            <i className="fa-solid fa-microphone-lines"></i> Mock interview
          </NavLink>
        </nav>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="main">
        {/* Global top-right avatar */}
        <div className="global-avatar">
          <AvatarMenu />
        </div>

        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/assessment"     element={<Assessment />} />
          <Route path="/career-advisor" element={<CareerAdvisor />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/profile"        element={<ProfilePage />} />
          <Route path="/security"       element={<SecurityPage />} />
          <Route path="/settings"       element={<SettingsPage />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/*"     element={<RequireAuth><AppShell /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Redirect already-logged-in users away from /login
function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading"><i className="fa-solid fa-spinner fa-spin"></i></div>;
  if (user)    return <Navigate to="/" replace />;
  return <Login />;
}
