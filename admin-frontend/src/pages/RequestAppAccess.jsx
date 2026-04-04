import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Mail, Building, Edit2, Trash2, Zap, Eye, X, Shield, Globe } from 'lucide-react';

const RequestAppAccess = ({ globalSearch }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/app-access`);
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching app access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this access request?')) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/app-access/${id}`);
        setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleUpdate = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/app-access/${selectedRequest._id}`, selectedRequest);
        setRequests(prev => prev.map(r => r._id === selectedRequest._id ? selectedRequest : r));
        setIsEditModalOpen(false);
    } catch (err) { alert('Update failed: ' + err.message); }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'badge badge-new';
      case 'Reviewing': return 'badge badge-inprog';
      case 'Granted': return 'badge badge-approved';
      case 'Denied': return 'badge badge-rejected';
      default: return 'badge badge-new';
    }
  };

  const filteredData = requests.filter(item => {
    const matchTab = activeTab === 'All' || item.status === activeTab;
    const searchVal = (searchQuery || globalSearch).toLowerCase();
    const matchSearch = !searchVal || 
      item.name?.toLowerCase().includes(searchVal) ||
      item.email?.toLowerCase().includes(searchVal) ||
      item.companyName?.toLowerCase().includes(searchVal) ||
      item.role?.toLowerCase().includes(searchVal) ||
      item.status?.toLowerCase().includes(searchVal);
    return matchTab && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-top" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-heading">System Access</div>
          <div className="page-title">App Access Requests</div>
        </div>
      </div>

      <div className="card">
        <div className="leads-top-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="tab-pills">
            {['All', 'New', 'Reviewing', 'Granted', 'Denied'].map(tab => (
              <button key={tab} className={`tab-pill${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search entity..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Identity</th>
                <th>Organization</th>
                <th>Role / Use Case</th>
                <th>Status</th>
                <th>Date</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>No records found.</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Mail size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.companyName || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{item.role || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.useCase || '—'}
                      </div>
                    </td>
                    <td><span className={getStatusBadgeClass(item.status)}>{item.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => { setSelectedRequest(item); setIsViewModalOpen(true); }}
                            className="btn-icon-view" 
                            title="View Credentials"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => { setSelectedRequest({...item}); setIsEditModalOpen(true); }}
                            className="btn-icon-edit" 
                            title="Edit Protocol"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="btn-icon-delete" 
                            title="Remove Request"
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
      </div>

      {/* ── Edit Modal for App Access ── */}
      {isEditModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="card-title">Edit Access Authorization</span>
              <button onClick={() => setIsEditModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Identifier Name</label>
                <input 
                  type="text" 
                  value={selectedRequest.name} 
                  onChange={e => setSelectedRequest({...selectedRequest, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Corporate Email</label>
                <input 
                  type="email" 
                  value={selectedRequest.email} 
                  onChange={e => setSelectedRequest({...selectedRequest, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Organization / Agency</label>
                <input 
                  type="text" 
                  value={selectedRequest.companyName || ''} 
                  onChange={e => setSelectedRequest({...selectedRequest, companyName: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Access Status</label>
                <select 
                  value={selectedRequest.status} 
                  onChange={e => setSelectedRequest({...selectedRequest, status: e.target.value})}
                >
                  <option value="New">New</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Granted">Granted</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Commit Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal for App Access Requests ── */}
      {isViewModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <span className="card-title">Access Authorization Protocol</span>
              <button onClick={() => setIsViewModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Requesting Identity</span>
                  <span className="detail-value">{selectedRequest.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Authorization Status</span>
                  <span className={getStatusBadgeClass(selectedRequest.status)} style={{ alignSelf: 'flex-start' }}>{selectedRequest.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Corporate Email</span>
                  <span className="detail-value">{selectedRequest.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Organization / Agency</span>
                  <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={14} color="var(--text-muted)" />
                    {selectedRequest.companyName || 'Private User'}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Requested Security Role</span>
                  <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--pink)', fontWeight: 800 }}>
                    <Shield size={14} />
                    {selectedRequest.role || 'General User'}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Protcol Submission Date</span>
                  <span className="detail-value">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-item detail-full-width">
                  <span className="detail-label">Proposed Multi-Vector Use Case</span>
                  <p style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid var(--border-light)' }}>
                    {selectedRequest.useCase || 'No specific use case defined by the applicant.'}
                  </p>
                </div>
                <div className="detail-item detail-full-width">
                    <span className="detail-label">Security Clearance</span>
                    <span className="detail-value" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        User must undergo manual verification before the 'Granted' status is confirmed. Access tokens will be dispatched to {selectedRequest.email}.
                    </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RequestAppAccess;
