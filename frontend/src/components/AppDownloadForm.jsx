import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaComment, FaBuilding, FaRocket } from 'react-icons/fa';
import '../styles/AppDownloadForm.css';

const AppDownloadForm = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        contact: '',
        feedback: '',
        companyName: '',
        companyEmail: '',
        companyContact: ''
    });

    const [latestVersion, setLatestVersion] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/app-version/latest`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data && !data.error) {
                    setLatestVersion(data);
                }
            } catch (err) {
                console.error('Failed to fetch latest APK:', err);
            }
        };
        fetchLatest();
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsSubmitted(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map the form data to the backend schema
            const payload = {
                name: formData.name,
                email: formData.email,
                companyName: formData.companyName,
                useCase: formData.feedback, // Sending the feedback as useCase
            };

            await fetch(`${process.env.REACT_APP_API_URL}/app-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            console.log('Form Submitted to Backend:', payload);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error processing your request. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="form-overlay" onClick={onClose}>
            <div className="form-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" aria-label="Close" onClick={onClose}>
                    <FaTimes />
                </button>

                <header className="modal-header">
                    <div className="header-icon-container">
                        <FaRocket className="header-icon" />
                    </div>
                    <h2>Request App Access</h2>
                    <p>Experience the next generation of drone ecosystem management. Fill in your details below to get started.</p>
                </header>

                {isSubmitted ? (
                    <div className="success-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div className="success-icon" style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>
                            <FaRocket />
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '12px' }}>Request Approved!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                            Thank you for your interest in Flyhub. You can now download the latest version of our app below.
                        </p>
                        
                        {latestVersion ? (
                            <div className="apk-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Flyhub Mobile v{latestVersion.version}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Android APK Archive</div>
                                
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                                    <a 
                                        href={latestVersion.apkUrl} 
                                        download 
                                        className="submit-btn" 
                                        style={{ 
                                            display: 'inline-block', 
                                            textDecoration: 'none',
                                            width: 'auto',
                                            padding: '12px 24px'
                                        }}
                                    >
                                        Download APK
                                    </a>
                                    <a 
                                        href="https://play.google.com/store/apps/details?id=aviatricks.flyhub&pcampaignid=web_share" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="submit-btn" 
                                        style={{ 
                                            display: 'inline-block', 
                                            textDecoration: 'none',
                                            width: 'auto',
                                            padding: '12px 24px',
                                            background: '#4285f4'
                                        }}
                                    >
                                        Get on Play Store
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="apk-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
                                    Direct APK download is currently unavailable, but you can get it from the Play Store:
                                </p>
                                <a 
                                    href="https://play.google.com/store/apps/details?id=aviatricks.flyhub&pcampaignid=web_share" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="submit-btn" 
                                    style={{ 
                                        display: 'inline-block', 
                                        textDecoration: 'none',
                                        width: 'auto',
                                        padding: '12px 32px',
                                        background: '#4285f4'
                                    }}
                                >
                                    Get it on Google Play
                                </a>
                            </div>
                        )}
                        
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                            Close window
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="download-form">
                        <div className="form-section">
                            <h3>
                                Contact Information
                                <span className="required-badge">Action Required</span>
                            </h3>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label htmlFor="name"><FaUser /> Full Name</label>
                                    <input id="name" type="text" name="name" required placeholder="e.g. John Doe" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="email"><FaEnvelope /> Email ID</label>
                                    <input id="email" type="email" name="email" required placeholder="john@company.com" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="location"><FaMapMarkerAlt /> City / Location</label>
                                    <input id="location" type="text" name="location" required placeholder="Bangalore, India" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="contact"><FaPhone /> WhatsApp / Contact</label>
                                    <input id="contact" type="tel" name="contact" required placeholder="+91 98765 43210" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                Organization (Optional)
                                <span className="optional-badge">Optional</span>
                            </h3>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label htmlFor="companyName"><FaBuilding /> Company Name</label>
                                    <input id="companyName" type="text" name="companyName" placeholder="Your Organization Ltd." onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="companyEmail"><FaEnvelope /> Company Email</label>
                                    <input id="companyEmail" type="email" name="email" placeholder="support@company.com" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="companyContact"><FaPhone /> Office Number</label>
                                    <input id="companyContact" type="tel" name="contact" placeholder="+91 123 456 7890" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                Requirements
                                <span className="required-badge">Action Required</span>
                            </h3>
                            <div className="input-group full-width">
                                <label htmlFor="feedback"><FaComment /> Tell us about your needs</label>
                                <textarea id="feedback" name="feedback" required placeholder="Tell us how Flyhub can help you manage your drone operations..." rows="3" onChange={handleChange}></textarea>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={!latestVersion}>
                                {latestVersion ? 'Request Access Now' : 'App Currently Unavailable'}
                            </button>
                            <p className="privacy-note">By clicking submit, you agree to our privacy policy and terms of service.</p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AppDownloadForm;
