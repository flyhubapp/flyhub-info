import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  X,
  Eye
} from 'lucide-react';

const Leads = ({ globalSearch }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);
        setLeads(response.data);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} lead?`)) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/${type}/${id}`);
        setLeads(prev => prev.filter(l => l._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const openEditModal = (lead) => {
    setSelectedLead({ ...lead });
    setIsEditModalOpen(true);
  };

  const openViewModal = (lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/${selectedLead.apiType}/${selectedLead._id}`, selectedLead);
        setLeads(prev => prev.map(l => l._id === selectedLead._id ? selectedLead : l));
        setIsEditModalOpen(false);
    } catch (err) { alert('Update failed: ' + err.message); }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'badge badge-new';
      case 'Contacted': return 'badge badge-inprog';
      case 'Approved': return 'badge badge-approved';
      case 'Rejected': return 'badge badge-rejected';
      default: return 'badge badge-new';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <Clock size={11} />;
      case 'Contacted': return <ExternalLink size={11} />;
      case 'Approved': return <CheckCircle size={11} />;
      case 'Rejected': return <XCircle size={11} />;
      default: return <Clock size={11} />;
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#e91e63', '#9c27b0', '#2196f3', '#009688', '#ff9800', '#4caf50'];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  };

  const filteredLeads = leads.filter(lead => {
    const matchTab = activeTab === 'All' || lead.status === activeTab;
    const searchVal = (searchQuery || globalSearch).toLowerCase();
    const matchSearch = !searchVal ||
      lead.name?.toLowerCase().includes(searchVal) ||
      lead.email?.toLowerCase().includes(searchVal) ||
      lead.phone?.toLowerCase().includes(searchVal) ||
      lead.location?.toLowerCase().includes(searchVal) ||
      lead.companyName?.toLowerCase().includes(searchVal) ||
      lead.type?.toLowerCase().includes(searchVal) ||
      lead.status?.toLowerCase().includes(searchVal);
    return matchTab && matchSearch;
  });

  const summaryStats = [
    { label: 'Total Inflow', value: leads.length, color: '#3f51b5', icon: Globe },
    { label: 'Awaiting Review', value: leads.filter(l => l.status === 'New' || l.status === 'Pending Verification').length, color: '#ff9800', icon: Clock },
    { label: 'Authorized', value: leads.filter(l => l.status === 'Approved' || l.status === 'Granted').length, color: '#4caf50', icon: ShieldCheck },
    { label: 'Denied', value: leads.filter(l => l.status === 'Rejected' || l.status === 'Denied').length, color: '#f44336', icon: XCircle },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page Title */}
      <div className="page-top" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-heading">Lead Acquisition Matrix</div>
          <div className="page-title">Access Control Pipeline</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
            Manage and authorize new operational accounts for the Flyhub ecosystem.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost">
            <Download size={15} />
            Export Data
          </button>
          <button className="btn btn-primary">
            <Zap size={15} />
            New Lead
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {summaryStats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {label}
            </div>
            <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: `${color}22` }}>
              <div style={{ height: '100%', borderRadius: 2, background: color, width: '60%', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Leads Table Card */}
      <div className="card">
        {/* Controls Bar */}
        <div className="leads-top-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          {/* Tab Pills */}
          <div className="tab-pills">
            {['All', 'New', 'Approved', 'Rejected', 'Contacted'].map(tab => (
              <button
                key={tab}
                className={`tab-pill${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <Filter size={15} />
          </button>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Identity / Organization</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Loading data...</div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <Zap size={36} style={{ marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>No leads found.</div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <tr key={lead._id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <span className="badge badge-inprog" style={{ fontSize: 9 }}>
                        {lead.type || 'Inquiry'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          className="avatar-init"
                          style={{ background: getAvatarColor(lead.name) }}
                        >
                          {lead.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.3 }}>
                            {lead.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Building size={11} color="var(--text-muted)" />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                              {lead.companyName || 'Private'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{lead.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {lead.location || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(lead.status)}>
                        {getStatusIcon(lead.status)}
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => openViewModal(lead)}
                            className="btn-icon-view" 
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => openEditModal(lead)}
                            className="btn-icon-edit" 
                            title="Full Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(lead.apiType, lead._id)}
                            className="btn-icon-delete" 
                            title="Discard Lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-light)',
          background: '#fafafa',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing {filteredLeads.length} of {leads.length || 1284} records
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Page 1 / 14</span>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }} disabled>
              <ChevronLeft size={14} />
            </button>
            <button className="btn btn-ghost" style={{ padding: '6px 10px' }} disabled>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal for All Lead Types ── */}
      {isEditModalOpen && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="card-title">Edit Master Lead: {selectedLead.type}</span>
              <button onClick={() => setIsEditModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Identifier / Name</label>
                <input 
                  type="text" 
                  value={selectedLead.name} 
                  onChange={e => setSelectedLead({...selectedLead, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Email Contact</label>
                <input 
                  type="email" 
                  value={selectedLead.email} 
                  onChange={e => setSelectedLead({...selectedLead, email: e.target.value})} 
                />
              </div>
              
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                    <label>Location / Unit</label>
                    <input 
                    type="text" 
                    value={selectedLead.location || ''} 
                    onChange={e => setSelectedLead({...selectedLead, location: e.target.value})} 
                    />
                </div>
                <div className="form-group">
                    <label>Company / Agency</label>
                    <input 
                    type="text" 
                    value={selectedLead.companyName || ''} 
                    onChange={e => setSelectedLead({...selectedLead, companyName: e.target.value})} 
                    />
                </div>
              </div>

              <div className="form-group">
                <label>Lead Process Status</label>
                <select 
                  value={selectedLead.status} 
                  onChange={e => setSelectedLead({...selectedLead, status: e.target.value})}
                >
                  <option value="New">New / Unprocessed</option>
                  <option value="Contacted">Contacted / In Progress</option>
                  <option value="Approved">Approved / Authorized</option>
                  <option value="Rejected">Rejected / Denied</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Dismiss</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Synchronize & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal for Lead Details ── */}
      {isViewModalOpen && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <span className="card-title">Lead Information Dossier</span>
              <button onClick={() => setIsViewModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Identity</span>
                  <span className="detail-value">{selectedLead.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Email</span>
                  <span className="detail-value">{selectedLead.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Primary Phone</span>
                  <span className="detail-value">{selectedLead.phone || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Geographical Location</span>
                  <span className="detail-value">{selectedLead.location || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Operational Unit / Agency</span>
                  <span className="detail-value">{selectedLead.companyName || 'Private Inquiry'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lead Status</span>
                  <span className={getStatusBadgeClass(selectedLead.status)}>
                    {getStatusIcon(selectedLead.status)}
                    {selectedLead.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Acquisition Date</span>
                  <span className="detail-value">
                    {new Date(selectedLead.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Data Source System</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                    {selectedLead.apiType || 'General'}
                  </span>
                </div>
                {selectedLead.message && (
                  <div className="detail-item detail-full-width">
                    <span className="detail-label">Supplementary Intelligence / Message</span>
                    <p style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid var(--border-light)' }}>
                      {selectedLead.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close Dossier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Leads;
