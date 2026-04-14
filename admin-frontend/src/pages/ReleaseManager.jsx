import React, { useState, useEffect } from 'react';
import { 
    Upload, 
    Smartphone, 
    Trash2, 
    Calendar, 
    Tag, 
    FileText,
    CheckCircle2,
    Clock,
    Download
} from 'lucide-react';

const ReleaseManager = () => {
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        version: '',
        releaseNotes: '',
        apk: null
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            const res = await fetch(`${apiUrl}/app-version`);
            const data = await res.json();
            setReleases(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch releases:', err);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, apk: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.apk || !formData.version) {
            setError('Please provide version and APK file.');
            return;
        }

        setUploading(true);
        setError('');

        const data = new FormData();
        data.append('version', formData.version);
        data.append('releaseNotes', formData.releaseNotes);
        data.append('apk', formData.apk);

        try {
            const res = await fetch(`${apiUrl}/app-version/upload`, {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setFormData({ version: '', releaseNotes: '', apk: null });
                // Reset file input
                e.target.reset();
                fetchReleases();
            } else {
                const errData = await res.json();
                setError(errData.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Failed to upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this release? This will remove the APK file from storage.')) return;

        try {
            const res = await fetch(`${apiUrl}/app-version/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchReleases();
            }
        } catch (err) {
            alert('Failed to delete release');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>App Release Manager</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        Upload and manage mobile application APK files
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                {/* Release History */}
                <div className="admin-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: '#6366f1' }}>
                            <Smartphone size={20} />
                        </div>
                        <h2 style={{ fontSize: '18px', margin: 0 }}>Release History</h2>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Loading history...</div>
                    ) : releases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No releases uploaded yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {releases.map((rel) => (
                                <div 
                                    key={rel._id} 
                                    style={{ 
                                        padding: '16px', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        transition: 'transform 0.2s',
                                        cursor: 'default'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ 
                                                fontSize: '16px', 
                                                fontWeight: '600', 
                                                color: rel.isActive ? '#10b981' : 'var(--text-primary)' 
                                            }}>
                                                v{rel.version}
                                            </span>
                                            {rel.isActive && (
                                                <span style={{ 
                                                    background: 'rgba(16, 185, 129, 0.1)', 
                                                    color: '#10b981', 
                                                    fontSize: '10px', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: '700'
                                                }}>
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} /> {new Date(rel.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={14} /> {rel.apkFilename}
                                            </span>
                                        </div>
                                        {rel.releaseNotes && (
                                            <div style={{ 
                                                marginTop: '12px', 
                                                fontSize: '13px', 
                                                color: 'rgba(255,255,255,0.7)',
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontFamily: 'monospace'
                                            }}>
                                                {rel.releaseNotes}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a 
                                            href={rel.apkUrl} 
                                            download 
                                            style={{ 
                                                padding: '8px', 
                                                color: '#6366f1', 
                                                borderRadius: '8px', 
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(rel._id)}
                                            style={{ 
                                                padding: '8px', 
                                                color: '#ef4444', 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                borderRadius: '8px', 
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Section */}
                <div>
                    <div className="admin-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                                <Upload size={20} />
                            </div>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>Push New Release</h2>
                        </div>

                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    Version Number
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 1.0.5" 
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: 'rgba(0,0,0,0.2)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    Release Notes
                                </label>
                                <textarea 
                                    placeholder="What's new in this version?" 
                                    rows="4"
                                    value={formData.releaseNotes}
                                    onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: 'rgba(0,0,0,0.2)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    APK File
                                </label>
                                <div style={{ 
                                    border: '2px dashed rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    padding: '20px', 
                                    textAlign: 'center',
                                    position: 'relative'
                                }}>
                                    <input 
                                        type="file" 
                                        accept=".apk"
                                        onChange={handleFileChange}
                                        style={{ 
                                            position: 'absolute', 
                                            inset: 0, 
                                            opacity: 0, 
                                            cursor: 'pointer' 
                                        }}
                                    />
                                    <Smartphone size={32} color={formData.apk ? '#10b981' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '13px', color: formData.apk ? 'white' : 'var(--text-muted)' }}>
                                        {formData.apk ? formData.apk.name : 'Select or drop APK file'}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div style={{ 
                                    padding: '12px', 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    color: '#ef4444', 
                                    borderRadius: '8px', 
                                    fontSize: '13px' 
                                }}>
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={uploading}
                                style={{ 
                                    padding: '12px', 
                                    background: '#6366f1', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: '600', 
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    marginTop: '8px',
                                    opacity: uploading ? 0.7 : 1
                                }}
                            >
                                {uploading ? 'Uploading APK...' : 'Publish Release'}
                            </button>
                        </form>
                    </div>

                    <div style={{ 
                        marginTop: '20px', 
                        padding: '16px', 
                        background: 'rgba(99, 102, 241, 0.05)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <FileText size={18} color="#6366f1" />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Push Policy</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
                                    Publishing a new release will automatically set it as the "Active" version for all users. Previous versions will remain in history but will be marked as inactive.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseManager;
