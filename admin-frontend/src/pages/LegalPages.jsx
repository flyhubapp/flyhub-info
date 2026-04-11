import React, { useState, useEffect } from 'react';
import { Shield, FileText, Save, History, CheckCircle, AlertCircle, Loader2, Eye, Edit3 } from 'lucide-react';

const LegalPages = () => {
    const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/legal/${activeTab}`);
            const data = await response.json();
            setContent(data.content || '');
            setLastUpdated(data.data?.lastUpdated || data.lastUpdated);
        } catch (error) {
            console.error('Error fetching legal content:', error);
            setStatus({ type: 'error', message: 'Failed to load content' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const response = await fetch(`${API_URL}/legal/${activeTab}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            if (data.success) {
                setStatus({ type: 'success', message: 'Content updated successfully' });
                setLastUpdated(data.data.lastUpdated);
                setTimeout(() => setStatus(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setStatus({ type: 'error', message: error.message || 'Failed to save content' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-top">
                <div>
                    <h5 className="page-heading">Content Management</h5>
                    <h1 className="page-title">Legal Pages</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {status && (
                        <div className={`status-badge ${status.type}`} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '6px 12px', 
                            borderRadius: '20px',
                            background: status.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: status.type === 'success' ? '#4caf50' : '#f44336',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {status.message}
                        </div>
                    )}
                    <button 
                        className="stat-card-pink" 
                        onClick={handleSave} 
                        disabled={saving || loading}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            border: 'none', 
                            padding: '10px 20px', 
                            borderRadius: '8px', 
                            color: 'white', 
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                            onClick={() => setActiveTab('terms')}
                            className={`tab-link ${activeTab === 'terms' ? 'active' : ''}`}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: 'none',
                                color: activeTab === 'terms' ? 'var(--pink)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: activeTab === 'terms' ? 700 : 500,
                                borderBottom: activeTab === 'terms' ? '3px solid var(--pink)' : '3px solid transparent',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <FileText size={16} />
                            Terms & Conditions
                        </button>
                        <button 
                            onClick={() => setActiveTab('privacy')}
                            className={`tab-link ${activeTab === 'privacy' ? 'active' : ''}`}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: 'none',
                                color: activeTab === 'privacy' ? 'var(--pink)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: activeTab === 'privacy' ? 700 : 500,
                                borderBottom: activeTab === 'privacy' ? '3px solid var(--pink)' : '3px solid transparent',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Shield size={16} />
                            Privacy Policy
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                        <History size={14} />
                        {lastUpdated ? `UPDATED: ${new Date(lastUpdated).toLocaleString().toUpperCase()}` : 'NEW DOCUMENT'}
                    </div>
                </div>

                <div className="split-container" style={{ display: 'flex', minHeight: '650px' }}>
                    {/* Left Side: Editor */}
                    <div className="editor-side" style={{ flex: 1, borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
                        <div className="side-label" style={{ padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <Edit3 size={14} /> EDITOR (HTML SUPPORTED)
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Enter ${activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} content here...`}
                            style={{
                                width: '100%',
                                flex: 1,
                                background: '#fff',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '20px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
                                resize: 'none',
                                outline: 'none'
                            }}
                            disabled={loading}
                        />
                    </div>

                    {/* Right Side: Preview */}
                    <div className="preview-side" style={{ flex: 1, background: '#fdfdfd', display: 'flex', flexDirection: 'column' }}>
                        <div className="side-label" style={{ padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--pink)' }}>
                            <Eye size={14} /> LIVE PREVIEW
                        </div>
                        <div className="preview-content" style={{ 
                            flex: 1, 
                            padding: '30px', 
                            overflowY: 'auto',
                            lineHeight: '1.8',
                            color: '#444',
                            fontSize: '15px'
                        }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    <Loader2 className="animate-spin" />
                                    <p style={{ marginTop: '10px', fontSize: '13px' }}>Syncing preview...</p>
                                </div>
                            ) : content ? (
                                <div dangerouslySetInnerHTML={{ __html: content }} className="legal-html-preview" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    <AlertCircle size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                    <p style={{ fontSize: '14px' }}>No content to preview.<br/>Start typing on the left to see changes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .tab-link:hover { color: var(--pink) !important; background: rgba(233, 30, 99, 0.05); }
                .stat-card-pink:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(233, 30, 99, 0.4); }
                .stat-card-pink:active { transform: translateY(0); }
                .stat-card-pink:disabled { opacity: 0.7; cursor: not-allowed; }

                /* Live Preview Styling to match Frontend */
                .legal-html-preview h1, .legal-html-preview h2, .legal-html-preview h3 { color: #2c3e50; margin: 1.5rem 0 1rem 0; }
                .legal-html-preview p { margin-bottom: 1rem; }
                .legal-html-preview ul, .legal-html-preview ol { padding-left: 20px; margin-bottom: 1rem; }
                .legal-html-preview li { margin-bottom: 0.5rem; }
                .legal-html-preview strong { color: #333; font-weight: 700; }
            `}</style>
        </div>
    );
};

export default LegalPages;
