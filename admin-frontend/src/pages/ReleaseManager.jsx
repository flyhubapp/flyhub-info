import React, { useState, useEffect, useRef } from 'react';
import {
    Upload,
    Smartphone,
    Trash2,
    Calendar,
    Tag,
    FileText,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    AlertCircle,
    X
} from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const ReleaseManager = () => {
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTask, setUploadTask] = useState(null); // for cancel support
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        version: '',
        releaseNotes: '',
        apkFilename: '',
        apkFile: null
    });
    const fileInputRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            const res = await fetch(`${apiUrl}/app-version`);
            const data = await res.json();
            setReleases(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch releases:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(prev => ({
            ...prev,
            apkFile: file,
            apkFilename: prev.apkFilename || file.name
        }));
        setError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.apk') || file.type === 'application/vnd.android.package-archive')) {
            setFormData(prev => ({
                ...prev,
                apkFile: file,
                apkFilename: prev.apkFilename || file.name
            }));
            setError('');
        } else {
            setError('Please drop a valid .apk file.');
        }
    };

    const handleCancelUpload = () => {
        if (uploadTask) {
            uploadTask.cancel();
            setUploading(false);
            setUploadProgress(0);
            setUploadTask(null);
            setError('Upload cancelled.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { version, apkFile, apkFilename } = formData;

        if (!version.trim()) { setError('Version number is required.'); return; }
        if (!apkFile) { setError('Please select an APK file.'); return; }

        setUploading(true);
        setError('');
        setSuccess('');
        setUploadProgress(0);

        try {
            // 1. Upload to Firebase Storage
            const safeFilename = apkFilename.trim() || apkFile.name;
            const storageRef = ref(storage, `apk-releases/v${version.trim()}/${safeFilename}`);
            const task = uploadBytesResumable(storageRef, apkFile, {
                contentType: 'application/vnd.android.package-archive',
                contentDisposition: `attachment; filename="${safeFilename}"`
            });
            setUploadTask(task);

            await new Promise((resolve, reject) => {
                task.on(
                    'state_changed',
                    (snapshot) => {
                        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setUploadProgress(pct);
                    },
                    (err) => reject(err),
                    () => resolve()
                );
            });

            // 2. Get the public download URL
            const downloadURL = await getDownloadURL(storageRef);

            // 3. Save metadata to backend
            const res = await fetch(`${apiUrl}/app-version/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: version.trim(),
                    releaseNotes: formData.releaseNotes.trim(),
                    apkUrl: downloadURL,
                    apkFilename: safeFilename,
                    storagePath: `apk-releases/v${version.trim()}/${safeFilename}`
                })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setFormData({ version: '', releaseNotes: '', apkFilename: '', apkFile: null });
                if (fileInputRef.current) fileInputRef.current.value = '';
                setSuccess(`✅ Version ${version.trim()} published successfully!`);
                fetchReleases();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(result.error || 'Backend failed to save release.');
            }
        } catch (err) {
            if (err.code === 'storage/canceled') {
                // already handled in cancel
            } else {
                console.error(err);
                setError(`Upload failed: ${err.message}`);
            }
        } finally {
            setUploading(false);
            setUploadTask(null);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id, version, storagePath) => {
        if (!window.confirm(`Delete release v${version}? The APK file will be removed from Firebase Storage.`)) return;

        try {
            // Delete from Firebase Storage if path exists
            if (storagePath) {
                try {
                    const storageRef = ref(storage, storagePath);
                    await deleteObject(storageRef);
                } catch (storageErr) {
                    console.warn('Storage delete failed (may already be gone):', storageErr.message);
                }
            }

            // Delete from backend
            const res = await fetch(`${apiUrl}/app-version/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReleases();
            } else {
                alert('Failed to delete release record.');
            }
        } catch {
            alert('Network error. Failed to delete.');
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                        Upload APK files to Firebase Storage and publish releases
                    </p>
                </div>
                <div style={{
                    padding: '6px 14px',
                    background: releases.some(r => r.isActive) ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                    color: releases.some(r => r.isActive) ? '#10b981' : 'var(--text-muted)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {releases.some(r => r.isActive) ? '● LIVE' : '○ NO ACTIVE RELEASE'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '24px', alignItems: 'start' }}>
                {/* Release History */}
                <div className="admin-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: '#6366f1' }}>
                            <Smartphone size={20} />
                        </div>
                        <h2 style={{ fontSize: '18px', margin: 0 }}>Release History</h2>
                        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {releases.length} release{releases.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <Clock size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
                            <div>Loading...</div>
                        </div>
                    ) : releases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <Smartphone size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                            <div style={{ fontSize: '15px', fontWeight: '500' }}>No releases yet</div>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>Upload your first APK →</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {releases.map((rel) => (
                                <div key={rel._id} style={{
                                    padding: '16px',
                                    background: rel.isActive ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    border: rel.isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '16px'
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{
                                                fontSize: '16px', fontWeight: '700',
                                                color: rel.isActive ? '#10b981' : 'var(--text-primary)'
                                            }}>
                                                v{rel.version}
                                            </span>
                                            {rel.isActive && (
                                                <span style={{
                                                    background: 'rgba(16,185,129,0.15)', color: '#10b981',
                                                    fontSize: '10px', padding: '2px 8px', borderRadius: '12px',
                                                    textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700'
                                                }}>● ACTIVE</span>
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
                                                marginTop: '8px', fontSize: '11px', color: '#6366f1',
                                                display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden'
                                            }}>
                                                <ExternalLink size={11} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    Firebase Storage
                                                </span>
                                            </div>
                                        )}

                                        {rel.releaseNotes && (
                                            <div style={{
                                                marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)',
                                                background: 'rgba(0,0,0,0.2)', padding: '8px 12px',
                                                borderRadius: '6px', lineHeight: '1.6', whiteSpace: 'pre-line'
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
                                                padding: '8px', color: '#6366f1', borderRadius: '8px',
                                                background: 'rgba(99,102,241,0.1)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                                            }}
                                            title="Download APK"
                                        >
                                            <Download size={15} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(rel._id, rel.version, rel.storagePath)}
                                            style={{
                                                padding: '8px', color: '#ef4444',
                                                background: 'rgba(239,68,68,0.1)', borderRadius: '8px',
                                                border: 'none', cursor: 'pointer'
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

                {/* Upload Form */}
                <div>
                    <div className="admin-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981' }}>
                                <Upload size={20} />
                            </div>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>Upload New Release</h2>
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
                                    onChange={(e) => setFormData(p => ({ ...p, version: e.target.value }))}
                                    style={inputStyle}
                                    required
                                    disabled={uploading}
                                />
                            </div>

                            {/* APK File Drop Zone */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    APK File *
                                </label>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    style={{
                                        border: `2px dashed ${formData.apkFile ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        background: formData.apkFile ? 'rgba(16,185,129,0.03)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".apk,application/vnd.android.package-archive"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                    <Smartphone
                                        size={28}
                                        color={formData.apkFile ? '#10b981' : 'rgba(255,255,255,0.2)'}
                                        style={{ marginBottom: '8px' }}
                                    />
                                    {formData.apkFile ? (
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                                                {formData.apkFile.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {formatBytes(formData.apkFile.size)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                Drop APK here or <span style={{ color: '#6366f1' }}>browse</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                                                .apk files only
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Display Filename */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Display Filename <span style={{ opacity: 0.5 }}>(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={`FlyHub-v${formData.version || '1.0.0'}.apk`}
                                    value={formData.apkFilename}
                                    onChange={(e) => setFormData(p => ({ ...p, apkFilename: e.target.value }))}
                                    style={inputStyle}
                                    disabled={uploading}
                                />
                            </div>

                            {/* Release Notes */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Release Notes
                                </label>
                                <textarea
                                    placeholder={"- Bug fixes\n- Performance improvements\n- New feature XYZ"}
                                    rows="3"
                                    value={formData.releaseNotes}
                                    onChange={(e) => setFormData(p => ({ ...p, releaseNotes: e.target.value }))}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                                    disabled={uploading}
                                />
                            </div>

                            {/* Upload Progress */}
                            {uploading && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                        <span>Uploading to Firebase Storage...</span>
                                        <span style={{ color: '#6366f1', fontWeight: '600' }}>{uploadProgress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${uploadProgress}%`,
                                            background: 'linear-gradient(90deg, #6366f1, #10b981)',
                                            borderRadius: '99px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* Error / Success */}
                            {error && (
                                <div style={{
                                    padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                    borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                            {success && (
                                <div style={{
                                    padding: '10px 14px', background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                    borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <CheckCircle2 size={14} /> {success}
                                </div>
                            )}

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: uploading ? 'rgba(99,102,241,0.4)' : '#6366f1',
                                        color: 'white', border: 'none', borderRadius: '8px',
                                        fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px', transition: 'background 0.2s'
                                    }}
                                >
                                    {uploading ? `Uploading ${uploadProgress}%...` : '🚀 Upload & Publish'}
                                </button>
                                {uploading && (
                                    <button
                                        type="button"
                                        onClick={handleCancelUpload}
                                        style={{
                                            padding: '12px 14px', background: 'rgba(239,68,68,0.1)',
                                            color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                        }}
                                        title="Cancel upload"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Storage info panel */}
                    <div style={{
                        marginTop: '16px', padding: '14px 16px',
                        background: 'rgba(99,102,241,0.05)', borderRadius: '12px',
                        border: '1px solid rgba(99,102,241,0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <FileText size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Firebase Storage</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.7' }}>
                                    APKs are stored in <code style={{ color: '#6366f1' }}>apk-releases/</code> in your Firebase project.
                                    Files persist permanently and are served via Google's CDN.
                                    Publishing a new version automatically deactivates the previous one.
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
