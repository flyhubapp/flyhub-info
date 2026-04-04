import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckSquare,
  HelpCircle,
  MessageSquare,
  UserPlus,
  MoreVertical,
  TrendingUp,
  Users,
  Activity,
  Globe
} from 'lucide-react';

/* ── helpers ── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ── Social Trends ── */
const socialTrends = [
  '#flyhub',
  '#innovation',
  '#dronefleet',
  '#futureoflogistics',
  '#automation',
  '#franchisehub',
];

/* ── Browser Usage donut ── */
const browsers = [
  { name: 'Chrome',  pct: 37, color: '#4caf50' },
  { name: 'Firefox', pct: 23, color: '#ff9800' },
  { name: 'Safari',  pct: 18, color: '#2196f3' },
  { name: 'Opera',   pct: 12, color: '#9c27b0' },
  { name: 'Edge',    pct: 10, color: '#e91e63' },
];

/* ── Mini line chart SVG (white) ── */
const MiniLineChart = ({ points, color = 'white' }) => {
  const w = 200, h = 60;
  const max = Math.max(...points, 1);
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1 || 1)) * w,
    y: h - (p / max) * (h - 8),
  }));
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <path d={d} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="3" fill="white" />
      ))}
    </svg>
  );
};

/* ── Area chart (CPU Usage style) ── */
const CpuAreaChart = ({ data }) => {
  const w = 800, h = 180;
  const max = 100;
  const pts = data.map((p, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (p / max) * h,
  }));
  const line = pts.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00bcd4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00bcd4" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 20, 40, 60, 80, 100].map(v => {
        const y = h - (v / max) * h;
        return (
          <g key={v}>
            <line x1={0} y1={y} x2={w} y2={y} stroke="#e0e0e0" strokeWidth="0.8" />
            <text x={-6} y={y + 4} textAnchor="end" fontSize="10" fill="#bbb">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#cpuGrad)" />
      <path d={line} fill="none" stroke="#00bcd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── SVG Donut ── */
const DonutChart = ({ browsers }) => {
  const size = 140, r = 52, cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = browsers.map(b => {
    const dash = (b.pct / 100) * circumference;
    const slice = { ...b, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f5" strokeWidth="20" />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="20"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#212121">
        {browsers[0].pct}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#9e9e9e" letterSpacing="1">
        {browsers[0].name.toUpperCase()}
      </text>
    </svg>
  );
};

/* ════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════ */
const Dashboard = ({ globalSearch }) => {
  const navigate = useNavigate();
  const [cpuData] = useState(() => Array.from({ length: 50 }, () => rand(10, 90)));
  const [realtimeOn, setRealtimeOn] = useState(true);

  // Live Data State
  const [stats, setStats] = useState({
    contacts: 0,
    franchises: 0,
    apps: 0,
    registrations: 0,
    total: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [contactRes, franchiseRes, appRes, registrationRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/contact`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/franchise`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/app-access`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/registration`).catch(() => ({ data: [] })),
        ]);
        
        const contacts = contactRes.data;
        const franchises = franchiseRes.data;
        const apps = appRes.data;
        const registrations = registrationRes.data;
        
        setStats({
          contacts: contacts.length,
          franchises: franchises.length,
          apps: apps.length,
          registrations: registrations.length,
          total: contacts.length + franchises.length + apps.length + registrations.length
        });
        
        // Combine all items into a unified "recent tasks" log
        const combined = [
          ...contacts.map(c => ({ id: c._id, task: 'Contact Request', status: c.status, manager: c.name, date: new Date(c.createdAt), path: '/contact' })),
          ...franchises.map(f => ({ id: f._id, task: 'Franchise App', status: f.status, manager: f.firstName, date: new Date(f.createdAt), path: '/franchise' })),
          ...apps.map(a => ({ id: a._id, task: 'App Access', status: a.status, manager: a.name, date: new Date(a.createdAt), path: '/request-access' })),
          ...registrations.map(r => ({ id: r._id, task: `${r.role === 'buyer' ? 'Buyer' : 'Seller'} Reg`, status: r.status, manager: r.fullName, date: new Date(r.createdAt), path: '/registrations' }))
        ];
        
        // Sort descending by date and slice latest 5
        const sorted = combined.sort((a,b) => b.date - a.date).slice(0, 5);
        setRecentActivities(sorted);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Determine badge colors dynamically based on status length/value logic
  const getBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if(s.includes('new')) return 'badge-todo';
    if(s.includes('review') || s.includes('prog')) return 'badge-inprog';
    if(s.includes('appr') || s.includes('res') || s.includes('done') || s.includes('granted')) return 'badge-done';
    return 'badge-rejected';
  };

  const getProgress = (status) => {
    const s = (status || '').toLowerCase();
    if(s.includes('new')) return { val: 20, class: 'progress-blue' };
    if(s.includes('review') || s.includes('prog')) return { val: 60, class: 'progress-orange' };
    if(s.includes('appr') || s.includes('res') || s.includes('done') || s.includes('granted')) return { val: 100, class: 'progress-green' };
    return { val: 100, class: 'progress-pink' };
  };

  /* ── Live Banner Stat Cards ── */
  const statCards = [
    { label: 'Franchise Apps', value: stats.franchises, color: 'stat-card-pink',   Icon: CheckSquare },
    { label: 'User Registrations', value: stats.registrations,   color: 'stat-card-cyan',   Icon: Users  },
    { label: 'Contact & Access',  value: stats.contacts + stats.apps,  color: 'stat-card-green',  Icon: MessageSquare },
    { label: 'Total Leads',  value: stats.total, color: 'stat-card-orange', Icon: TrendingUp    },
  ];

  // Pink card mini chart data
  const pinkData  = [60, 70, 50, 90, 40, 80, 65, 75, 55, 85, 45, 70, 80, 60, 90, 50];
  const miniStats = [
    { label: 'Platform Reqs',     value: stats.total, badge: 'total' },
    { label: 'New Today', value: recentActivities.length, badge: 'recent' },
    { label: 'Accounts', value: stats.registrations, badge: 'users' },
  ];

  const ticketData = [
    { label: 'Contacts',     value: stats.contacts,    unit: 'msgs' },
    { label: 'Franchise', value: stats.franchises,    unit: 'apps' },
    { label: 'App Access', value: stats.apps,    unit: 'reqs' },
    { label: 'Total',     value: stats.total,  unit: 'leads' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Banner Stat Cards ── */}
      <div className="stat-cards-grid" style={{ marginBottom: 24 }}>
        {statCards.map(({ label, value, color, Icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-card-icon">
              <Icon size={28} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-value">{value}</div>
            </div>
          </div>
        ))}
      </div>


      {/* ── 3-column info cards ── */}
      <div className="info-cards-grid">

        {/* Pink stat card with mini chart */}
        <div className="mini-stat-card mini-stat-pink">
          <div style={{ padding: '0 20px 4px', paddingTop: 0 }}>
            <MiniLineChart points={pinkData} color="pink" />
          </div>
          <div style={{ padding: '4px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {miniStats.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75 }}>{s.label}</span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>
                  {s.value}
                  <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6, marginLeft: 4, letterSpacing: 1 }}>{s.badge}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cyan — Latest Social Trends */}
        <div className="mini-stat-card mini-stat-cyan">
          <div style={{ padding: '14px 20px 4px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Trending Hashtags
            </span>
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            {socialTrends.map(tag => (
              <div key={tag} className="trend-item">
                <span className="trend-item-tag">{tag}</span>
                <div className="trend-icon">
                  <TrendingUp size={13} color="white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teal — Answered Tickets / Contact Requests */}
        <div className="mini-stat-card mini-stat-teal">
          <div style={{ padding: '14px 20px 4px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Inbox Traffic
            </span>
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            {ticketData.map(t => (
              <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{t.label}</span>
                <span style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>
                  {t.value.toLocaleString()}
                  <span style={{ fontSize: 9, opacity: 0.55, marginLeft: 4, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{t.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Task Table + Browser Usage ── */}
      <div className="bottom-grid">

        {/* Recent Inquiries / Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent System Activities</span>
            <button className="card-menu-btn"><MoreVertical size={16} /></button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities
                  .filter(row => {
                    if (!globalSearch) return true;
                    const search = globalSearch.toLowerCase();
                    return row.task?.toLowerCase().includes(search) ||
                           row.status?.toLowerCase().includes(search) ||
                           row.manager?.toLowerCase().includes(search);
                  })
                  .length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>No activities matching "{globalSearch}"</td></tr>
                ) : (
                  recentActivities
                    .filter(row => {
                      if (!globalSearch) return true;
                      const search = globalSearch.toLowerCase();
                      return row.task?.toLowerCase().includes(search) ||
                             row.status?.toLowerCase().includes(search) ||
                             row.manager?.toLowerCase().includes(search);
                    })
                    .map((row, idx) => {
                    const prog = getProgress(row.status);
                    return (
                    <tr 
                      key={row.id} 
                      onClick={() => navigate(row.path)}
                      style={{ cursor: 'pointer' }}
                      className="clickable-row"
                    >
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>
                        {row.date.toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.task}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{row.manager}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar-wrap">
                            <div
                              className={`progress-bar-fill ${prog.class}`}
                              style={{ width: `${prog.val}%` }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 30 }}>
                            {prog.val}%
                          </span>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Browser Usage */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Browser Analytics</span>
            <button className="card-menu-btn"><MoreVertical size={16} /></button>
          </div>
          <div className="card-body">
            <div className="donut-chart-wrap">
              <DonutChart browsers={browsers} />
            </div>
            <div className="browser-list">
              {browsers.map(b => (
                <div key={b.name} className="browser-item">
                  <div className="browser-dot" style={{ background: b.color }} />
                  <span className="browser-name">{b.name}</span>
                  <div className="progress-bar-wrap" style={{ width: 80 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${b.pct}%`, background: b.color }}
                    />
                  </div>
                  <span className="browser-pct">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
