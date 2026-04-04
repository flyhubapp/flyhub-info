import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const AdminLogin = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, credentials);
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                onLogin();
            }
        } catch (err) {
            setError('Invalid username or password credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <ShieldCheck size={32} color="var(--pink)" />
                    </div>
                    <h2>Flyhub Mission Control</h2>
                    <p>Enter your authorization credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Username</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter admin username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                Authenticate <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>V1.0.0 Secure Access Layer</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
