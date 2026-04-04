import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building,
    Mail,
    Smartphone,
    ChevronRight,
    Zap,
    Image as ImageIcon
} from 'lucide-react';

/* ── Nav Item ── */
const NavItem = ({ icon: Icon, label, path, active, badge }) => {
    return (
        <Link to={path} className={`sidebar-nav-item${active ? ' active' : ''}`}>
            <Icon size={17} className="nav-icon" />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span className="sidebar-nav-badge">{badge}</span>}
            {active && !badge && <ChevronRight size={13} className="sidebar-nav-chevron" />}
        </Link>
    );
};

/* ── Sidebar ── */
const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const mainNav = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Leads Matrix', icon: Zap, path: '/leads' },
        { label: 'Registrations', icon: Zap, path: '/registrations' },
        { label: 'Franchise', icon: Building, path: '/franchise' },
        { label: 'Contact', icon: Mail, path: '/contact' },
        { label: 'App Access', icon: Smartphone, path: '/request-access' },
        { label: 'Media Archive', icon: ImageIcon, path: '/media' },
    ];

    return (
        <>
            <div className={`sidebar-overlay${isOpen ? ' visible' : ''}`} onClick={onClose} />
            <aside className={`admin-sidebar${isOpen ? ' open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <img 
                        src="/logo.svg" 
                        alt="Flyhub Logo" 
                        style={{ 
                            width: 32, 
                            height: 32, 
                            objectFit: 'contain', 
                            marginRight: 12,
                            filter: 'drop-shadow(0 0 8px rgba(63, 81, 181, 0.3))'
                        }} 
                    />
                    <div>
                        <div className="sidebar-brand-name">FLYHUB</div>
                        <div className="sidebar-brand-sub">Mission Control</div>
                    </div>
                </div>

                {/* Main Nav */}
                <div className="sidebar-section-label">Main Navigation</div>
                <nav className="sidebar-nav">
                    {mainNav.map(item => (
                        <NavItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                {/* Version Footer */}
                <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: 1 }}>
                        v1.0.0 2026
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
