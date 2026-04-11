import React, { useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Users,
  Activity,
  Terminal,
  ShieldCheck,
  Grid3x3,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  FileText,
  Map,
  BarChart2,
  Star,
  AlertCircle,
  Info
} from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import Contact from './pages/Contact.jsx';
import Franchise from './pages/Franchise.jsx';
import RequestAppAccess from './pages/RequestAppAccess.jsx';
import Registrations from './pages/Registrations.jsx';
import MediaManager from './pages/MediaManager.jsx';
import LegalPages from './pages/LegalPages.jsx';
import Sidebar from './pages/sidebar.jsx';

import NotificationDropdown from './pages/NotificationDropdown.jsx';
import './admin.css';

/* ── System Status ── */
const SystemStatus = () => {
    const [connected, setConnected] = React.useState(false);
    React.useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
                if(res.ok) setConnected(true);
            } catch(e) { setConnected(false); }
        };
        check();
        const interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="system-status">
            <div className="status-pulse" style={{ background: connected ? '#4caf50' : '#f44336' }} />
            <span style={{ color: connected ? 'var(--text-secondary)' : 'var(--red)' }}>
                {connected ? 'Cloud Connected' : 'Local Offline'}
            </span>
        </div>
    );
};



/* ── Header ── */
const Header = ({ onMenuClick, onLogout, search, setSearch }) => (
  <header className="admin-header">
    <div className="header-left">
      <button
        onClick={onMenuClick}
        className="header-icon-btn"
        style={{ display: 'none' }}
        id="sidebar-toggle"
      >
        <Menu size={20} />
      </button>

      <div>
        <div className="header-breadcrumb">Home / Dashboard</div>
        <div className="header-title">Dashboard</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div className="header-search">
        <Search size={14} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Global search..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={12} color="var(--text-muted)" />
            </button>
        )}
      </div>

      <div className="header-right">
        <SystemStatus />
        <NotificationDropdown />

        <div className="header-avatar" onClick={onLogout} title="Logout">AD</div>
      </div>
    </div>
  </header>
);

import AdminLogin from './pages/AdminLogin.jsx';

/* ── App ── */
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [globalSearch, setGlobalSearch] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="admin-shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="admin-main">
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            onLogout={handleLogout} 
            search={globalSearch}
            setSearch={setGlobalSearch}
          />

          <main className="admin-page">
            <Routes>
              <Route path="/" element={<Dashboard globalSearch={globalSearch} />} />
              <Route path="/leads" element={<Leads globalSearch={globalSearch} />} />
              <Route path="/contact" element={<Contact globalSearch={globalSearch} />} />
              <Route path="/franchise" element={<Franchise globalSearch={globalSearch} />} />
              <Route path="/registrations" element={<Registrations globalSearch={globalSearch} />} />
              <Route path="/request-access" element={<RequestAppAccess globalSearch={globalSearch} />} />
              <Route path="/media" element={<MediaManager />} />
              <Route path="/legal" element={<LegalPages />} />
              <Route path="*" element={<Dashboard globalSearch={globalSearch} />} />

            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
