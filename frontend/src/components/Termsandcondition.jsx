import React, { useState, useEffect } from 'react';
import '../styles/Termsandcondition.css';

const TermsAndConditions = () => {
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/legal/terms`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        console.log('📄 Legal API Data (Terms):', data);

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
        console.error('❌ Error fetching terms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="terms-container">
      <header className="terms-header">
        <div className="header-content">
          <h1>Terms and Conditions</h1>
          <button className="back-button" onClick={() => window.history.back()}>
            ← Back
          </button>
        </div>
        <div className="last-updated-header">
           {lastUpdated ? `Last updated on ${lastUpdated}` : 'Loading...'}
        </div>
      </header>

      <main className="terms-content">        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading Terms and Conditions...</p>
          </div>
        ) : content ? (
          <div 
            className="dynamic-content" 
            dangerouslySetInnerHTML={{ __html: content }} 
            style={{ lineHeight: '1.8', color: '#444' }}
          />
        ) : (
          <div className="no-content">
            <p>Terms and Conditions will be updated soon.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TermsAndConditions;