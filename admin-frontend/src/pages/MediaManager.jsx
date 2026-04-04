import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, Copy, Check, Image as ImageIcon, X, FileText, ExternalLink } from 'lucide-react';

const MediaManager = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/media`);
            setMedia(res.data);
        } catch (err) {
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/media/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchMedia();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset forever?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/media/${id}`);
            setMedia(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Page Header */}
            <div className="page-top" style={{ marginBottom: 0 }}>
                <div>
                    <div className="page-heading">Brand Intelligence</div>
                    <div className="page-title">Media Archive</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                        Internal repository for official Flyhub visual assets and system imagery.
                    </p>
                </div>
                <div>
                    <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {uploading ? 'Processing...' : <><Upload size={16} /> Upload New Asset</>}
                        <input type="file" hidden onChange={handleUpload} accept="image/*" disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="card" style={{ padding: 24, minHeight: '60vh' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
                        Scanning Archive...
                    </div>
                ) : media.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, opacity: 0.5 }}>
                        <ImageIcon size={64} style={{ marginBottom: 16 }} />
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Archive Empty</div>
                        <div style={{ fontSize: 13 }}>No visual assets found in the core depository.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                        {media.map((item) => (
                            <div key={item._id} className="media-card" style={{ 
                                border: '1px solid var(--border)', 
                                borderRadius: 12, 
                                overflow: 'hidden',
                                background: '#fff',
                                transition: 'transform 0.2s ease',
                                position: 'relative'
                            }}>
                                {/* Image Preview Container */}
                                <div style={{ height: 180, background: '#f4f6f8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img 
                                        src={item.url} 
                                        alt={item.originalname} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div className="media-overlay" style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s',
                                        display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <button 
                                            onClick={() => window.open(item.url, '_blank')}
                                            className="btn-icon-view" style={{ background: '#fff', color: '#000' }}>
                                            <ExternalLink size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="btn-icon-delete" style={{ background: '#fff', color: 'red' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Metadata Pod */}
                                <div style={{ padding: 16 }}>
                                    <div style={{ 
                                        fontWeight: 700, 
                                        fontSize: 13, 
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        marginBottom: 4
                                    }}>
                                        {item.originalname}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FileText size={10} /> {formatSize(item.size)}
                                        </div>
                                        <div style={{ textTransform: 'uppercase' }}>{item.mimetype.split('/')[1]}</div>
                                    </div>

                                    {/* Action Row */}
                                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                        <button 
                                            onClick={() => copyToClipboard(item.url, item._id)}
                                            style={{ 
                                                flex: 1, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: 8,
                                                padding: '8px',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: copiedId === item._id ? '#4caf50' : '#f0f2f5',
                                                color: copiedId === item._id ? '#fff' : 'var(--text-primary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {copiedId === item._id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Source URL</>}
                                        </button>
                                    </div>
                                </div>

                                <style dangerouslySetInnerHTML={{ __html: `
                                    .media-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
                                    .media-card:hover .media-overlay { opacity: 1 !important; }
                                `}} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaManager;
