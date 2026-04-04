import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit2, Trash2, Building, MapPin, Mail, Phone, Calendar, X, Eye, ShieldCheck, Briefcase } from 'lucide-react';

const Registrations = ({ globalSearch }) => {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/registration`);
      setRegistrations(res.data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/registration/${id}`);
        setRegistrations(prev => prev.filter(r => r._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const openEditModal = (reg) => {
    setSelectedReg({ ...reg });
    setIsEditModalOpen(true);
  };

  const openViewModal = (reg) => {
    setSelectedReg(reg);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/registration/${selectedReg._id}`, selectedReg);
        setRegistrations(prev => prev.map(r => r._id === selectedReg._id ? selectedReg : r));
        setIsEditModalOpen(false);
    } catch (err) { alert('Update failed: ' + err.message); }
  };


  const filteredData = registrations.filter(item => {
    const searchVal = (searchTerm || globalSearch).toLowerCase();
    const matchesSearch = !searchVal || 
      item.fullName?.toLowerCase().includes(searchVal) ||
      item.email?.toLowerCase().includes(searchVal) ||
      item.phone?.toLowerCase().includes(searchVal) ||
      item.company?.toLowerCase().includes(searchVal) ||
      item.location?.toLowerCase().includes(searchVal) ||
      item.role?.toLowerCase().includes(searchVal) ||
      item.status?.toLowerCase().includes(searchVal);
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && item.role === activeTab;
  });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">User Registrations</h1>
          <p className="page-subheading">Manage buyer and seller applications</p>
        </div>
        <div className="page-actions">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="tabs-row">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All registrations ({registrations.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'buyer' ? 'active' : ''}`}
          onClick={() => setActiveTab('buyer')}
        >
          Buyers ({registrations.filter(r => r.role === 'buyer').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
          onClick={() => setActiveTab('seller')}
        >
          Sellers ({registrations.filter(r => r.role === 'seller').length})
        </button>
      </div>

      <div className="card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Business Info</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading registrations...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No registrations found.</td></tr>
              ) : (
                filteredData.map((reg) => (
                  <tr key={reg._id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar-small">
                          {reg.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="user-name">{reg.fullName}</div>
                          <div className="user-meta">
                            <Mail size={12} /> {reg.email}
                          </div>
                          <div className="user-meta">
                            <Phone size={12} /> {reg.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${reg.role === 'seller' ? 'badge-inprog' : 'badge-done'}`}>
                        {reg.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {reg.role === 'seller' ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{reg.company}</div>
                          <div className="user-meta"><Building size={12} /> {reg.businessType}</div>
                          <div className="user-meta"><MapPin size={12} /> {reg.location}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="user-meta"><MapPin size={12} /> {reg.address}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-todo">{reg.status}</span>
                    </td>
                    <td>
                      <div className="user-meta">
                        <Calendar size={12} /> {new Date(reg.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            onClick={() => openViewModal(reg)}
                            className="btn-icon-view" 
                            title="View Full Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            onClick={() => openEditModal(reg)}
                            className="btn-icon-edit" 
                            title="Full Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(reg._id)}
                            className="btn-icon-delete" 
                            title="Remove Application"
                          >
                            <Trash2 size={13} />
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

      {/* ── Edit Registration Modal ── */}
      {isEditModalOpen && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="card-title">Edit User Application</span>
              <button onClick={() => setIsEditModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Representative Name</label>
                <input 
                  type="text" 
                  value={selectedReg.fullName} 
                  onChange={e => setSelectedReg({...selectedReg, fullName: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Business Email</label>
                <input 
                  type="email" 
                  value={selectedReg.email} 
                  onChange={e => setSelectedReg({...selectedReg, email: e.target.value})} 
                />
              </div>
              
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Role</label>
                  <select value={selectedReg.role} onChange={e => setSelectedReg({...selectedReg, role: e.target.value})}>
                    <option value="buyer">Buyer Profile</option>
                    <option value="seller">Seller Profile</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Account Status</label>
                  <select value={selectedReg.status} onChange={e => setSelectedReg({...selectedReg, status: e.target.value})}>
                    <option value="Pending">Pending Audit</option>
                    <option value="Verified">Verified / Live</option>
                  </select>
                </div>
              </div>

              {selectedReg.role === 'seller' && (
                <div className="form-group">
                  <label>Company / Brand Name</label>
                  <input 
                    type="text" 
                    value={selectedReg.company || ''} 
                    onChange={e => setSelectedReg({...selectedReg, company: e.target.value})} 
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Update & Sync</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal for Registration Details ── */}
      {isViewModalOpen && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="user-avatar-small" style={{ width: 40, height: 40, fontSize: 16 }}>{selectedReg.fullName?.charAt(0)}</div>
                <div>
                  <span className="card-title">{selectedReg.fullName}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ID: {selectedReg._id?.slice(-8).toUpperCase()}</div>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Registration Role</span>
                  <span className={`badge ${selectedReg.role === 'seller' ? 'badge-inprog' : 'badge-done'}`} style={{ alignSelf: 'flex-start' }}>
                    {selectedReg.role?.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Audit Status</span>
                  <span className="badge badge-todo" style={{ alignSelf: 'flex-start' }}>{selectedReg.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Primary Email</span>
                  <span className="detail-value">{selectedReg.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">{selectedReg.phone}</span>
                </div>

                {selectedReg.role === 'seller' ? (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Corporate Name</span>
                      <span className="detail-value">{selectedReg.company}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Industry Sector</span>
                      <span className="detail-value">{selectedReg.businessType}</span>
                    </div>
                    <div className="detail-item detail-full-width">
                      <span className="detail-label">Headquarters Address</span>
                      <span className="detail-value">{selectedReg.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Established / Reference Date</span>
                      <span className="detail-value">{selectedReg.date || '—'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-item detail-full-width">
                      <span className="detail-label">Residential / Billing Address</span>
                      <span className="detail-value">{selectedReg.address || '—'}</span>
                    </div>
                  </>
                )}

                <div className="detail-item">
                  <span className="detail-label">Profile Created</span>
                  <span className="detail-value">{new Date(selectedReg.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Dismiss Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Registrations;
