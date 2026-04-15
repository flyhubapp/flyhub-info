import React, { useState, useEffect } from 'react';
import { 
    Link,
    Smartphone, 
    Trash2, 
    Calendar, 
    Tag, 
    FileText,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

const ReleaseManager = () => {
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        version: '',
        releaseNotes: '',
        apkUrl: '',
        apkFilename: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            const res = await fetch(`${apiUrl}/app-version`);
            const data = await res.json();
            setReleases(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch releases:', err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { version, apkUrl, apkFilename } = formData;

        if (!version.trim()) {
            setError('Version number is required.');
            return;
        }
        if (!apkUrl.trim()) {
            setError('APK download URL is required.');
            return;
        }
        // Basic URL validation
        try {
            new URL(apkUrl);
        } catch {
            setError('Please enter a valid URL (must start with https://).');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${apiUrl}/app-version/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: version.trim(),
                    releaseNotes: formData.releaseNotes.trim(),
                    apkUrl: apkUrl.trim(),
                    apkFilename: apkFilename.trim() || `FlyHub-v${version.trim()}.apk`
                })
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setFormData({ version: '', releaseNotes: '', apkUrl: '', apkFilename: '' });
                setSuccess(`✅ Version ${version} published successfully!`);
                fetchReleases();
                setTimeout(() => setSuccess(''), 4000);
            } else {
                setError(result.error || 'Failed to publish release.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, version) => {
        if (!window.confirm(`Delete release v${version}? This cannot be undone.`)) return;

        try {
            const res = await fetch(`${apiUrl}/app-version/${id}`, { method: 'DELETE' });
            if (res.ok) fetchReleases();
            else alert('Failed to delete release.');
        } catch {
            alert('Network error. Failed to delete.');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>App Release Manager</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        Publish APK releases using direct download links — no file upload needed
                    </p>
                </div>
                <div style={{
                    padding: '6px 14px',
                    background: 'rgba(16,185,129,0.1)',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {releases.filter(r => r.isActive).length > 0 ? '● LIVE' : '○ NO ACTIVE RELEASE'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
                {/* Release History */}
                <div className="admin-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: '#6366f1' }}>
                            <Smartphone size={20} />
                        </div>
                        <h2 style={{ fontSize: '18px', margin: 0 }}>Release History</h2>
                        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {releases.length} release{releases.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                            <div>Loading history...</div>
                        </div>
                    ) : releases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <Smartphone size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                            <div style={{ fontSize: '15px', fontWeight: '500' }}>No releases yet</div>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>Publish your first release using the form →</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {releases.map((rel) => (
                                <div
                                    key={rel._id}
                                    style={{
                                        padding: '16px',
                                        background: rel.isActive ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        border: rel.isActive
                                            ? '1px solid rgba(16,185,129,0.2)'
                                            : '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: rel.isActive ? '#10b981' : 'var(--text-primary)'
                                            }}>
                                                v{rel.version}
                                            </span>
                                            {rel.isActive && (
                                                <span style={{
                                                    background: 'rgba(16,185,129,0.15)',
                                                    color: '#10b981',
                                                    fontSize: '10px',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.8px',
                                                    fontWeight: '700'
                                                }}>
                                                    ● ACTIVE
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} />
                                                {new Date(rel.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            {rel.apkFilename && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Tag size={12} /> {rel.apkFilename}
                                                </span>
                                            )}
                                        </div>

                                        {rel.apkUrl && (
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '11px',
                                                color: '#6366f1',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <ExternalLink size={11} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rel.apkUrl}
                                                </span>
                                            </div>
                                        )}

                                        {rel.releaseNotes && (
                                            <div style={{
                                                marginTop: '10px',
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.6)',
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {rel.releaseNotes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                        <a
                                            href={rel.apkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '8px',
                                                color: '#6366f1',
                                                borderRadius: '8px',
                                                background: 'rgba(99,102,241,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textDecoration: 'none'
                                            }}
                                            title="Open download link"
                                        >
                                            <Download size={15} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(rel._id, rel.version)}
                                            style={{
                                                padding: '8px',
                                                color: '#ef4444',
                                                background: 'rgba(239,68,68,0.1)',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete release"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Publish Form */}
                <div>
                    <div className="admin-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
                                <Link size={20} />
                            </div>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>Publish New Release</h2>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Version */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Version Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1.2.0"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            {/* APK Download URL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    APK Download URL *
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://drive.google.com/uc?id=..."
                                    value={formData.apkUrl}
                                    onChange={(e) => setFormData({ ...formData, apkUrl: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Paste a direct link from Google Drive, Firebase Storage, or GitHub Releases
                                </div>
                            </div>

                            {/* File Name (optional) */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Display Filename <span style={{ opacity: 0.5 }}>(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={`FlyHub-v${formData.version || '1.0.0'}.apk`}
                                    value={formData.apkFilename}
                                    onChange={(e) => setFormData({ ...formData, apkFilename: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Release Notes */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Release Notes
                                </label>
                                <textarea
                                    placeholder={"- Bug fixes\n- Performance improvements\n- New feature XYZ"}
                                    rows="4"
                                    value={formData.releaseNotes}
                                    onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '10px 14px',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}

                            {success && (
                                <div style={{
                                    padding: '10px 14px',
                                    background: 'rgba(16,185,129,0.1)',
                                    color: '#10b981',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <CheckCircle2 size={14} /> {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '12px',
                                    background: saving ? 'rgba(99,102,241,0.5)' : '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    marginTop: '4px',
                                    fontSize: '14px',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {saving ? 'Publishing...' : '🚀 Publish Release'}
                            </button>
                        </form>
                    </div>

                    {/* Info panel */}
                    <div style={{
                        marginTop: '16px',
                        padding: '14px 16px',
                        background: 'rgba(99,102,241,0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(99,102,241,0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <FileText size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>How to get a direct link</div>
                                <ul style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', paddingLeft: '16px', lineHeight: '1.8' }}>
                                    <li><b>Google Drive:</b> Share → "Anyone with link" → copy link, change <code>/view</code> to <code>/uc?export=download</code></li>
                                    <li><b>Firebase Storage:</b> Copy the download URL from the console</li>
                                    <li><b>GitHub Releases:</b> Right-click the .apk asset → Copy link address</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseManager;
