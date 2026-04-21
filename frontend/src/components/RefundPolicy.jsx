import React, { useState, useEffect } from 'react';
import '../styles/PrivacyPolicy.css';

const RefundPolicy = () => {
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/legal/refund`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        console.log('📄 Legal API Data (Refund):', data);
        
        if (data && typeof data.content === 'string') {
          setContent(data.content);
          if (data.lastUpdated) {
            setLastUpdated(new Date(data.lastUpdated).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }));
          }
        }
      } catch (error) {
        console.error('❌ Error fetching refund policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="privacy-policy-container">
      <header className="privacy-policy-header">
        <div className="header-content">
          <h1>Refund Policy</h1>
          <button className="back-button" onClick={() => window.history.back()}>
            ← Back
          </button>
        </div>
        <div className="last-updated-header">
          {lastUpdated ? `Last updated on ${lastUpdated}` : 'Loading...'}
        </div>
      </header>

      <main className="privacy-policy-content">
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Fetching latest refund policy...</p>
          </div>
        ) : content ? (
          <div 
            className="dynamic-content" 
            dangerouslySetInnerHTML={{ __html: content }} 
            style={{ lineHeight: '1.8', color: '#444' }}
          />
        ) : (
          <div className="empty-content">
            <p>Refund Policy content has not been updated yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RefundPolicy;
