import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext.jsx';
import { Bell, X, Check, CheckCheck } from 'lucide-react';

const typeColors = {
    expense_approved: 'var(--success)',
    expense_rejected: 'var(--danger)',
    event_approved: 'var(--success)',
    event_rejected: 'var(--danger)',
    reallocation_approved: 'var(--success)',
    reallocation_rejected: 'var(--danger)',
    info: 'var(--info)'
};

const typeLabels = {
    expense_approved: 'Expense Approved',
    expense_rejected: 'Expense Rejected',
    event_approved: 'Event Approved',
    event_rejected: 'Event Rejected',
    reallocation_approved: 'Reallocation Approved',
    reallocation_rejected: 'Reallocation Rejected',
    info: 'Info'
};

export default function NotificationBar() {
    const { userData, isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const API = 'http://localhost:4000/api/notifications';

    const fetchNotifications = async () => {
        if (!userData?.name) return;
        try {
            const { data } = await axios.get(`${API}/${userData.name}`);
            if (data.success) setNotifications(data.notifications);
        } catch (e) { /* silent */ }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userData]);

    const markAllRead = async () => {
        try {
            await axios.patch(`${API}/${userData.name}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { /* silent */ }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={`NotificationContainer ${isSidebarOpen ? 'active' : ''}`}>
            <div className="notify-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={17} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Notifications</span>
                    {unreadCount > 0 && (
                        <span style={{ fontSize: 11, background: 'var(--danger)', color: 'white', padding: '2px 7px', borderRadius: '99px', fontWeight: 700 }}>{unreadCount}</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} title="Mark all read" style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCheck size={13} /> All read
                        </button>
                    )}
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>
            </div>
            <div className="notifyinner">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={40} style={{ color: 'var(--border)', marginBottom: 12 }} />
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div key={n._id} className={`notifyitem ${!n.read ? 'unread' : ''}`}>
                            <div className="notifyitem-type" style={{ color: typeColors[n.type] || 'var(--text-muted)' }}>
                                {typeLabels[n.type] || 'Notification'}
                            </div>
                            <div className="notifyitem-msg">{n.message}</div>
                            <div className="notifyitem-time">
                                {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}