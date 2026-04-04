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

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
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
                body: JSON.stringify(payload)
            });

            console.log('Form Submitted to Backend:', payload);
            alert('Thank you for your interest! We will contact you soon.');
            onClose();
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
                                <input id="companyEmail" type="email" name="companyEmail" placeholder="support@company.com" onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="companyContact"><FaPhone /> Office Number</label>
                                <input id="companyContact" type="tel" name="companyContact" placeholder="+91 123 456 7890" onChange={handleChange} />
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
                        <button type="submit" className="submit-btn">
                            Request Access Now
                        </button>
                        <p className="privacy-note">By clicking submit, you agree to our privacy policy and terms of service.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppDownloadForm;
