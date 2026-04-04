import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Mail, Edit2, Trash2, X, Eye, MessageSquare, Phone } from 'lucide-react';

const Contact = ({ globalSearch }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/contact`);
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/contact/${id}`);
        setContacts(prev => prev.filter(c => c._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'New' ? 'Responded' : 'New';
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/contact/${id}`, { status: newStatus });
        setContacts(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (err) { alert('Update failed: ' + err.message); }
  };

  const openEditModal = (item) => {
    setSelectedItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL}/contact/${selectedItem._id}`, selectedItem);
        setContacts(prev => prev.map(c => c._id === selectedItem._id ? selectedItem : c));
        setIsEditModalOpen(false);
    } catch (err) { alert('Update failed: ' + err.message); }
  };


  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'badge badge-new';
      case 'Responded': return 'badge badge-approved';
      default: return 'badge badge-new';
    }
  };

  const filteredData = contacts.filter(item => {
    const matchTab = activeTab === 'All' || item.status === activeTab;
    const searchVal = (searchQuery || globalSearch).toLowerCase();
    const matchSearch = !searchVal || 
      item.name?.toLowerCase().includes(searchVal) ||
      item.email?.toLowerCase().includes(searchVal) ||
      item.phone?.toLowerCase().includes(searchVal) ||
      item.subject?.toLowerCase().includes(searchVal) ||
      item.message?.toLowerCase().includes(searchVal) ||
      item.status?.toLowerCase().includes(searchVal);
    return matchTab && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div className="page-top" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-heading">Communication Log</div>
          <div className="page-title">Contact Inquiries</div>
        </div>
      </div>

      <div className="card">
        <div className="leads-top-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="tab-pills">
            {['All', 'New', 'Responded'].map(tab => (
              <button key={tab} className={`tab-pill${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name / Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>No records found.</td></tr>
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
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {item.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {item.subject || 'No Subject'}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                      {item.message}
                    </td>
                    <td><span className={getStatusBadgeClass(item.status)}>{item.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                     <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={() => { setSelectedItem(item); setIsViewModalOpen(true); }}
                          className="btn-icon-view" 
                          title="View Message"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => openEditModal(item)}
                          className="btn-icon-edit" 
                          title="Full Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="btn-icon-delete" 
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
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

      {/* ── Edit Modal ── */}
      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="card-title">Edit Inquiry Details</span>
              <button onClick={() => setIsEditModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={selectedItem.name} 
                    onChange={e => setSelectedItem({...selectedItem, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={selectedItem.email} 
                    onChange={e => setSelectedItem({...selectedItem, email: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={selectedItem.phone} 
                  onChange={e => setSelectedItem({...selectedItem, phone: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  value={selectedItem.subject} 
                  onChange={e => setSelectedItem({...selectedItem, subject: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Message Content</label>
                <textarea 
                  rows="4"
                  value={selectedItem.message} 
                  onChange={e => setSelectedItem({...selectedItem, message: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Management Status</label>
                <select 
                  value={selectedItem.status} 
                  onChange={e => setSelectedItem({...selectedItem, status: e.target.value})}
                >
                  <option value="New">New</option>
                  <option value="Responded">Responded</option>
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

      {/* ── View Modal for Contact Details ── */}
      {isViewModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card wide">
            <div className="modal-header">
              <span className="card-title">Inquiry Intelligence Report</span>
              <button onClick={() => setIsViewModalOpen(false)} className="card-menu-btn"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Contact Primary Identity</span>
                  <span className="detail-value">{selectedItem.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Communication Status</span>
                  <span className={getStatusBadgeClass(selectedItem.status)} style={{ alignSelf: 'flex-start' }}>{selectedItem.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Route: Email Address</span>
                  <span className="detail-value">{selectedItem.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Route: Phone Link</span>
                  <span className="detail-value">{selectedItem.phone || 'No Phone Provided'}</span>
                </div>
                <div className="detail-item detail-full-width">
                  <span className="detail-label">Subject of Inquiry</span>
                  <div className="detail-value" style={{ fontSize: 16, borderLeft: '4px solid var(--pink)', paddingLeft: 12 }}>
                    {selectedItem.subject || 'N/A'}
                  </div>
                </div>
                <div className="detail-item detail-full-width">
                  <span className="detail-label">Transmission Metadata</span>
                  <span className="detail-value">
                    Logged at {new Date(selectedItem.createdAt).toLocaleString()} from Public Web Inflow
                  </span>
                </div>
                <div className="detail-item detail-full-width">
                  <span className="detail-label">Message Payload</span>
                  <div style={{ background: '#f4f6f8', padding: 20, borderRadius: 12, border: '1px solid var(--border)', lineHeight: 1.6, color: 'var(--text-primary)', fontSize: 14 }}>
                    {selectedItem.message}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Close Inquiry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Contact;
