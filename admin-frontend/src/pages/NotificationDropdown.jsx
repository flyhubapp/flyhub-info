import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await handleMarkAsRead(notif._id);
        }
        setIsOpen(false);
        navigate(notif.link);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                className="header-icon-btn" 
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={18} className={unreadCount > 0 ? 'text-indigo-500 animate-pulse' : ''} />
                {unreadCount > 0 && <span className="header-notif-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="notif-mark-all">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="notif-body">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={32} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif._id} 
                                    className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="notif-icon">
                                        <div className={`icon-circle ${notif.type.toLowerCase()}`}>
                                            {notif.type === 'Contact' && <Clock size={14} />}
                                            {notif.type === 'Franchise' && <ExternalLink size={14} />}
                                            {notif.type === 'AppAccess' && <Check size={14} />}
                                            {notif.type === 'Registration' && <Bell size={14} />}
                                        </div>
                                    </div>
                                    <div className="notif-content">
                                        <p className="notif-title">{notif.title}</p>
                                        <p className="notif-message">{notif.message}</p>
                                        <p className="notif-time">
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notif.isRead && <div className="unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="notif-footer">
                        <button onClick={() => navigate('/leads')}>View all activity</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
