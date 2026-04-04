import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Mail, Edit2, Trash2, Building, Eye, X, Smartphone, DollarSign } from 'lucide-react';

const Franchise = ({ globalSearch }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/franchise`);
      setFranchises(res.data);
    } catch (err) {
      console.error('Error fetching franchise requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this franchise application?')) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/franchise/${id}`);
        setFranchises(prev => prev.filter(f => f._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleUpdate = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/franchise/${selectedFranchise._id}`, selectedFranchise);
        setFranchises(prev => prev.map(f => f._id === selectedFranchise._id ? selectedFranchise : f));
        setIsEditModalOpen(false);
    } catch (err) { alert('Update failed: ' + err.message); }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'badge badge-new';
      case 'Under Review': return 'badge badge-inprog';
      case 'Approved': return 'badge badge-approved';
      case 'Rejected': return 'badge badge-rejected';
      default: return 'badge badge-new';
    }
  };

  const filteredData = franchises.filter(item => {
    const matchTab = activeTab === 'All' || item.status === activeTab;
    const searchVal = (searchQuery || globalSearch).toLowerCase();
    const matchSearch = !searchVal || 
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchVal) ||
      item.email?.toLowerCase().includes(searchVal) ||
      item.phone?.toLowerCase().includes(searchVal) ||
      item.location?.toLowerCase().includes(searchVal) ||
      item.status?.toLowerCase().includes(searchVal);
    return matchTab && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div className="page-top" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-heading">Partner Network</div>
          <div className="page-title">Franchise Applications</div>
        </div>
      </div>

      <div className="card">
        <div className="leads-top-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="tab-pills">
            {['All', 'New', 'Under Review', 'Approved', 'Rejected'].map(tab => (
              <button key={tab} className={`tab-pill${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search applicant..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Contact Details</th>
                <th>Location</th>
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
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{item.firstName} {item.lastName}</div>
                      {item.investmentLevel && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                          Inv: {item.investmentLevel}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={12} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.email}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.location}</span>
                      </div>
                    </td>
                    <td><span className={getStatusBadgeClass(item.status)}>{item.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => { setSelectedFranchise(item); setIsViewModalOpen(true); }}
                            className="btn-icon-view" 
                            title="Review Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => { setSelectedFranchise({...item}); setIsEditModalOpen(true); }}
                            className="btn-icon-edit" 
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="btn-icon-delete" 
                            title="Remove Application"
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

      {/* ── Edit Modal for Franchise Details ── */}
      {isEditModalOpen && selectedFranchise && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="card-title">Edit Franchise Application</span>
              <button onClick={() => setIsEditModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={selectedFranchise.firstName} 
                    onChange={e => setSelectedFranchise({...selectedFranchise, firstName: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={selectedFranchise.lastName} 
                    onChange={e => setSelectedFranchise({...selectedFranchise, lastName: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={selectedFranchise.email} 
                  onChange={e => setSelectedFranchise({...selectedFranchise, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Target Location</label>
                <input 
                  type="text" 
                  value={selectedFranchise.location} 
                  onChange={e => setSelectedFranchise({...selectedFranchise, location: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={selectedFranchise.status} 
                  onChange={e => setSelectedFranchise({...selectedFranchise, status: e.target.value})}
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal for Franchise Details ── */}
      {isViewModalOpen && selectedFranchise && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <span className="card-title">Franchise Partnership Dossier</span>
              <button onClick={() => setIsViewModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Applicant Name</span>
                  <span className="detail-value">{selectedFranchise.firstName} {selectedFranchise.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Application Status</span>
                  <span className={getStatusBadgeClass(selectedFranchise.status)} style={{ alignSelf: 'flex-start' }}>{selectedFranchise.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Email</span>
                  <span className="detail-value">{selectedFranchise.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Connectivity</span>
                  <span className="detail-value">{selectedFranchise.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Target Location</span>
                  <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    {selectedFranchise.location}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Investment Commitment</span>
                  <div className="detail-value" style={{ color: 'var(--green)', fontWeight: 800 }}>
                    {selectedFranchise.investmentLevel || 'Not Specified'}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Submission Date</span>
                  <span className="detail-value">{new Date(selectedFranchise.createdAt).toLocaleString()}</span>
                </div>
                {selectedFranchise.businessExperience && (
                  <div className="detail-item detail-full-width">
                    <span className="detail-label">Professional Background / Experience</span>
                    <p style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid var(--border-light)' }}>
                      {selectedFranchise.businessExperience}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Franchise;
