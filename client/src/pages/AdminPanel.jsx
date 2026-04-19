import Nav from "../components/Nav.jsx";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import BudgetVsSpent from "../components/charts/BudgetVsSpent.jsx";
import CategoryPieChart from "../components/charts/CategoryPieChart.jsx";
import ExpenseTrendLine from "../components/charts/ExpenseTrendLine.jsx";
import {
    LayoutDashboard, ClipboardCheck, FileText, ArrowRightLeft,
    Wallet, CheckCircle, Clock, AlertCircle, CalendarDays,
    Download, X, Check, BarChart2
} from 'lucide-react';

const API = "http://localhost:4000/api/events";

const statusBadge = (s) => {
    const map = { pending: 'badge-pending', upcoming: 'badge-upcoming', ongoing: 'badge-ongoing', completed: 'badge-completed', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
};
const expBadge = (s) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
};

export default function AdminPanel() {
    const { userData } = useContext(AppContext);
    const [page, setPage] = useState("overview");
    const [events, setEvents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [rejectModal, setRejectModal] = useState({ open: false, type: null, eventId: null, expenseId: null, requestId: null });
    const [rejectReason, setRejectReason] = useState("");
    const [receiptModal, setReceiptModal] = useState(null);

    const fetchAll = async () => {
        try {
            const [evRes, anRes] = await Promise.all([
                axios.get(`${API}/all`),
                axios.get(`${API}/analytics`)
            ]);
            setEvents(evRes.data.events || []);
            if (anRes.data.success) setAnalytics(anRes.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { if (userData) fetchAll(); }, [userData]);

    const approveEvent = async (eventId) => {
        try {
            const res = await axios.patch(`${API}/${eventId}/approve`);
            if (res.data.success) { fetchAll(); toast.success("Event approved. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const rejectEvent = async () => {
        try {
            const res = await axios.patch(`${API}/${rejectModal.eventId}/reject`, { reason: rejectReason });
            if (res.data.success) { fetchAll(); closeRejectModal(); toast.success("Event rejected. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const approveExpense = async (eventId, expenseId) => {
        try {
            const res = await axios.patch(`${API}/${eventId}/expenses/${expenseId}/approve`);
            if (res.data.success) { fetchAll(); toast.success("Expense approved. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const rejectExpense = async () => {
        try {
            const res = await axios.patch(`${API}/${rejectModal.eventId}/expenses/${rejectModal.expenseId}/reject`, { reason: rejectReason });
            if (res.data.success) { fetchAll(); closeRejectModal(); toast.success("Expense rejected. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const approveRealloc = async (eventId, requestId) => {
        const msg = window.prompt("Add an optional message to the organizer (leave empty to skip):") ?? '';
        try {
            const res = await axios.patch(`${API}/${eventId}/reallocation/${requestId}/approve`, { adminMessage: msg });
            if (res.data.success) { fetchAll(); toast.success("Reallocation approved. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const rejectRealloc = async () => {
        try {
            const res = await axios.patch(`${API}/${rejectModal.eventId}/reallocation/${rejectModal.requestId}/reject`, { adminMessage: rejectReason });
            if (res.data.success) { fetchAll(); closeRejectModal(); toast.success("Reallocation rejected. Organizer notified."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const openRejectModal = (type, eventId, opts = {}) => {
        setRejectReason("");
        setRejectModal({ open: true, type, eventId, expenseId: opts.expenseId || null, requestId: opts.requestId || null });
    };
    const closeRejectModal = () => setRejectModal({ open: false, type: null, eventId: null, expenseId: null, requestId: null });

    const handleReject = () => {
        if (!rejectReason.trim()) { toast.error("Please provide a rejection reason"); return; }
        if (rejectModal.type === 'event') rejectEvent();
        else if (rejectModal.type === 'expense') rejectExpense();
        else if (rejectModal.type === 'realloc') rejectRealloc();
    };

    const totalBudget = events.reduce((s, e) => s + e.budget, 0);
    const totalSpent = events.reduce((s, e) => s + e.totalSpent, 0);
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const pendingExpenses = events.reduce((s, ev) => s + ev.expenses.filter(x => x.approvalStatus === 'pending').length, 0);
    const pendingReallocs = events.reduce((s, ev) => s + (ev.reallocationRequests?.filter(r => r.status === 'pending').length || 0), 0);

    const navItems = [
        { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
        { key: 'events', label: 'Event Approvals', Icon: ClipboardCheck, badge: pendingEvents },
        { key: 'expenses', label: 'Expense Approvals', Icon: CheckCircle, badge: pendingExpenses },
        { key: 'reallocation', label: 'Reallocations', Icon: ArrowRightLeft, badge: pendingReallocs },
        { key: 'reports', label: 'Reports', Icon: FileText },
    ];

    if (loading) return (
        <>
            <Nav />
            <div className="loading" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="loading-spinner"></div>
                <p>Loading admin dashboard...</p>
            </div>
        </>
    );

    return (
        <>
            <Nav />
            <div className="organizerContainer">
                <div className="sidePanel">
                    <div className="sidePanel-logo">
                        <h3>Admin Panel</h3>
                        <p style={{ fontSize: 12, color: 'var(--sidebar-text)', marginTop: 2 }}>{userData?.name}</p>
                    </div>
                    <div className="sideContent">
                        <ul>
                            {navItems.map(({ key, label, Icon, badge }) => (
                                <li key={key}>
                                    <button className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
                                        <Icon size={16} /> {label}
                                        {badge > 0 && (
                                            <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', fontSize: 11, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>{badge}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mainPanel">
                    <div className="mainContent">

                        {/* OVERVIEW */}
                        {page === 'overview' && (
                            <>
                                <div className="page-header">
                                    <div><h1>Financial Overview</h1><p>System-wide budget and event status.</p></div>
                                </div>
                                <div className="eventDashContent">
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--primary)', '--card-icon-bg': 'var(--primary-light)', '--card-icon-color': 'var(--primary)' }}>
                                        <div className="card-icon"><CalendarDays size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Events</h4>
                                        <h1>{events.length}</h1>
                                        <p className="card-sub">{pendingEvents} pending review</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--success)', '--card-icon-bg': 'var(--success-light)', '--card-icon-color': 'var(--success)' }}>
                                        <div className="card-icon"><Wallet size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Fund Allocated</h4>
                                        <h1>₹{totalBudget.toLocaleString()}</h1>
                                        <p className="card-sub">Across all {events.length} events</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--info)', '--card-icon-bg': 'var(--info-light)', '--card-icon-color': 'var(--info)' }}>
                                        <div className="card-icon"><CheckCircle size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Spent (Approved)</h4>
                                        <h1>₹{totalSpent.toLocaleString()}</h1>
                                        <p className="card-sub">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% utilized</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--warning)', '--card-icon-bg': 'var(--warning-light)', '--card-icon-color': 'var(--warning)' }}>
                                        <div className="card-icon"><Clock size={20} strokeWidth={1.75} /></div>
                                        <h4>Pending Actions</h4>
                                        <h1>{pendingEvents + pendingExpenses + pendingReallocs}</h1>
                                        <p className="card-sub">{pendingEvents} events, {pendingExpenses} expenses, {pendingReallocs} reallocations</p>
                                    </div>
                                </div>

                                {analytics && (
                                    <div className="charts-grid">
                                        <div className="chart-card">
                                            <h3>Budget vs Spent</h3>
                                            <p>Allocation and spending per event</p>
                                            <BudgetVsSpent data={analytics.perEvent} />
                                        </div>
                                        <div className="chart-card">
                                            <h3>Category Breakdown</h3>
                                            <p>Approved expenses by category</p>
                                            <CategoryPieChart data={analytics.categoryBreakdown} />
                                        </div>
                                        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                            <h3>Expense Trend</h3>
                                            <p>Approved spending across all events over time</p>
                                            <ExpenseTrendLine data={analytics.expenseTrend} />
                                        </div>
                                    </div>
                                )}

                                <div className="section-card">
                                    <h2>All Events</h2>
                                    <div className="table-wrapper">
                                        <table id="orgEventTable">
                                            <thead><tr>
                                                <th>Event</th><th>Organizer</th><th>Date</th><th>Budget</th><th>Spent</th><th>Remaining</th><th>Status</th>
                                            </tr></thead>
                                            <tbody>
                                                {events.map(ev => (
                                                    <tr key={ev._id}>
                                                        <td><strong>{ev.eventName}</strong></td>
                                                        <td>{ev.organizer?.name || '—'}</td>
                                                        <td>{new Date(ev.eventDate).toLocaleDateString('en-IN')}</td>
                                                        <td>₹{ev.budget.toLocaleString()}</td>
                                                        <td>₹{ev.totalSpent.toLocaleString()}</td>
                                                        <td>₹{(ev.budget - ev.totalSpent).toLocaleString()}</td>
                                                        <td>{statusBadge(ev.status)}</td>
                                                    </tr>
                                                ))}
                                                {events.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No events found</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* EVENT APPROVALS */}
                        {page === 'events' && (
                            <>
                                <div className="page-header">
                                    <div><h1>Event Approvals</h1><p>Review and approve or reject event submissions from organizers.</p></div>
                                </div>
                                {events.filter(e => e.status === 'pending').length === 0 ? (
                                    <div className="empty-state" style={{ marginTop: 60 }}>
                                        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 12 }} />
                                        <h3>All caught up!</h3>
                                        <p>No pending event approvals.</p>
                                    </div>
                                ) : (
                                    <div className="allEventExpense">
                                        {events.filter(e => e.status === 'pending').map(ev => (
                                            <div key={ev._id} className="eventExpenseCard">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                                    <div>
                                                        <h2 style={{ marginBottom: 4 }}>{ev.eventName}</h2>
                                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                            {ev.organizer?.name} &nbsp;|&nbsp;
                                                            {new Date(ev.eventDate).toLocaleDateString('en-IN')} &nbsp;|&nbsp;
                                                            Budget: ₹{ev.budget.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <button id="approveBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => approveEvent(ev._id)}>
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button id="rejectBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => openRejectModal('event', ev._id)}>
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="section-card" style={{ marginTop: 24 }}>
                                    <h2>Processed Events</h2>
                                    <div className="table-wrapper">
                                        <table id="orgEventTable">
                                            <thead><tr><th>Event</th><th>Organizer</th><th>Budget</th><th>Status</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {events.filter(e => e.status !== 'pending').map(ev => (
                                                    <tr key={ev._id}>
                                                        <td><strong>{ev.eventName}</strong></td>
                                                        <td>{ev.organizer?.name}</td>
                                                        <td>₹{ev.budget.toLocaleString()}</td>
                                                        <td>{statusBadge(ev.status)}</td>
                                                        <td>
                                                            {ev.status === 'rejected' && (
                                                                <button id="approveBut" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => approveEvent(ev._id)}>
                                                                    <Check size={12} /> Re-approve
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {events.filter(e => e.status !== 'pending').length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No processed events yet</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* EXPENSE APPROVALS */}
                        {page === 'expenses' && (
                            <>
                                <div className="page-header">
                                    <div><h1>Expense Approvals</h1><p>Review and approve or reject organizer expense submissions.</p></div>
                                </div>
                                {events.every(ev => ev.expenses.filter(x => x.approvalStatus === 'pending').length === 0) ? (
                                    <div className="empty-state" style={{ marginTop: 60 }}>
                                        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 12 }} />
                                        <h3>All expenses reviewed!</h3>
                                        <p>No pending expense approvals.</p>
                                    </div>
                                ) : (
                                    <div className="allEventExpense">
                                        {events.map(ev => {
                                            const pendingExps = ev.expenses.filter(x => x.approvalStatus === 'pending');
                                            if (pendingExps.length === 0) return null;
                                            return (
                                                <div key={ev._id} className="eventExpenseCard">
                                                    <h2 style={{ marginBottom: 4 }}>{ev.eventName}</h2>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                                        {ev.organizer?.name} | Budget: ₹{ev.budget.toLocaleString()} | {pendingExps.length} pending expense{pendingExps.length > 1 ? 's' : ''}
                                                    </p>
                                                    <div className="table-wrapper">
                                                        <table id="orgEventTable">
                                                            <thead><tr>
                                                                <th>Category</th><th>Description</th><th>Date</th><th>Amount</th><th>Receipt</th><th>Actions</th>
                                                            </tr></thead>
                                                            <tbody>
                                                                {pendingExps.map(exp => (
                                                                    <tr key={exp._id}>
                                                                        <td><span className="badge badge-upcoming">{exp.category}</span></td>
                                                                        <td>{exp.description}</td>
                                                                        <td>{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                                                                        <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                                                                        <td>
                                                                            {exp.receiptImage
                                                                                ? <img src={exp.receiptImage} alt="Receipt" className="receipt-preview" onClick={() => setReceiptModal(exp.receiptImage)} />
                                                                                : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>}
                                                                        </td>
                                                                        <td>
                                                                            <button id="approveBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => approveExpense(ev._id, exp._id)}>
                                                                                <Check size={13} /> Approve
                                                                            </button>
                                                                            <button id="rejectBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => openRejectModal('expense', ev._id, { expenseId: exp._id })}>
                                                                                <X size={13} /> Reject
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* REALLOCATIONS */}
                        {page === 'reallocation' && (
                            <>
                                <div className="page-header">
                                    <div><h1>Budget Reallocation Requests</h1><p>Review organizer requests to increase event budgets.</p></div>
                                </div>
                                {events.every(ev => !ev.reallocationRequests?.some(r => r.status === 'pending')) ? (
                                    <div className="empty-state" style={{ marginTop: 60 }}>
                                        <ArrowRightLeft size={48} style={{ color: 'var(--border)', marginBottom: 12 }} />
                                        <h3>No pending requests</h3>
                                        <p>All reallocation requests have been reviewed.</p>
                                    </div>
                                ) : (
                                    <div className="allEventExpense">
                                        {events.map(ev => {
                                            const pending = ev.reallocationRequests?.filter(r => r.status === 'pending') || [];
                                            if (pending.length === 0) return null;
                                            return (
                                                <div key={ev._id} className="eventExpenseCard">
                                                    <h2 style={{ marginBottom: 4 }}>{ev.eventName}</h2>
                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                                        {ev.organizer?.name} | Current Budget: ₹{ev.budget.toLocaleString()}
                                                    </p>
                                                    {pending.map(r => (
                                                        <div key={r._id} style={{ background: 'var(--warning-light)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 12 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                                                <div>
                                                                    <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                                                                        Requested: ₹{r.requestedAmount.toLocaleString()}
                                                                        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
                                                                            (₹{r.currentBudget.toLocaleString()} → ₹{r.requestedAmount.toLocaleString()})
                                                                        </span>
                                                                    </p>
                                                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{r.message}</p>
                                                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                                        Requested {new Date(r.requestedAt).toLocaleDateString('en-IN')}
                                                                    </p>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: 10 }}>
                                                                    <button id="approveBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => approveRealloc(ev._id, r._id)}>
                                                                        <Check size={14} /> Approve
                                                                    </button>
                                                                    <button id="rejectBut" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => openRejectModal('realloc', ev._id, { requestId: r._id })}>
                                                                        <X size={14} /> Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="section-card" style={{ marginTop: 24 }}>
                                    <h2>Reallocation History</h2>
                                    <div className="table-wrapper">
                                        <table id="orgEventTable">
                                            <thead><tr><th>Event</th><th>Organizer</th><th>Previous Budget</th><th>Requested</th><th>Status</th><th>Admin Note</th></tr></thead>
                                            <tbody>
                                                {events.flatMap(ev =>
                                                    (ev.reallocationRequests || []).filter(r => r.status !== 'pending').map(r => (
                                                        <tr key={r._id}>
                                                            <td>{ev.eventName}</td>
                                                            <td>{ev.organizer?.name}</td>
                                                            <td>₹{r.currentBudget?.toLocaleString()}</td>
                                                            <td>₹{r.requestedAmount?.toLocaleString()}</td>
                                                            <td>{<span className={`badge ${r.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}>{r.status}</span>}</td>
                                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.adminMessage || '—'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                                {events.every(ev => !ev.reallocationRequests?.some(r => r.status !== 'pending')) &&
                                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No history yet</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* REPORTS */}
                        {page === 'reports' && (
                            <>
                                <div className="page-header">
                                    <div><h1>Financial Reports</h1><p>Complete budget status across all events.</p></div>
                                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={() => {
                                        const rows = [['Event', 'Organizer', 'Budget', 'Spent', 'Remaining', '% Used', 'Status']];
                                        events.forEach(ev => rows.push([ev.eventName, ev.organizer?.name, ev.budget, ev.totalSpent, ev.budget - ev.totalSpent, ev.budget > 0 ? ((ev.totalSpent / ev.budget) * 100).toFixed(1) + '%' : '0%', ev.status]));
                                        const csv = rows.map(r => r.join(',')).join('\n');
                                        const a = document.createElement('a');
                                        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                                        a.download = 'eventify_report.csv';
                                        a.click();
                                    }}>
                                        <Download size={15} /> Export CSV
                                    </button>
                                </div>

                                <div className="eventDashContent">
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--primary)', '--card-icon-bg': 'var(--primary-light)', '--card-icon-color': 'var(--primary)' }}>
                                        <div className="card-icon"><CalendarDays size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Events</h4>
                                        <h1>{events.length}</h1>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--success)', '--card-icon-bg': 'var(--success-light)', '--card-icon-color': 'var(--success)' }}>
                                        <div className="card-icon"><Wallet size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Fund Allocated</h4>
                                        <h1>₹{totalBudget.toLocaleString()}</h1>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--info)', '--card-icon-bg': 'var(--info-light)', '--card-icon-color': 'var(--info)' }}>
                                        <div className="card-icon"><CheckCircle size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Approved Spend</h4>
                                        <h1>₹{totalSpent.toLocaleString()}</h1>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--warning)', '--card-icon-bg': 'var(--warning-light)', '--card-icon-color': 'var(--warning)' }}>
                                        <div className="card-icon"><AlertCircle size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Remaining</h4>
                                        <h1>₹{(totalBudget - totalSpent).toLocaleString()}</h1>
                                    </div>
                                </div>

                                <div className="section-card">
                                    <h2>All Events Budget Status</h2>
                                    <div className="table-wrapper">
                                        <table id="orgEventTable">
                                            <thead><tr>
                                                <th>Event</th><th>Organizer</th><th>Budget</th><th>Approved Spend</th><th>Remaining</th><th>% Used</th><th>Status</th>
                                            </tr></thead>
                                            <tbody>
                                                {events.map(ev => {
                                                    const pct = ev.budget > 0 ? (ev.totalSpent / ev.budget) * 100 : 0;
                                                    return (
                                                        <tr key={ev._id}>
                                                            <td><strong>{ev.eventName}</strong></td>
                                                            <td>{ev.organizer?.name}</td>
                                                            <td>₹{ev.budget.toLocaleString()}</td>
                                                            <td>₹{ev.totalSpent.toLocaleString()}</td>
                                                            <td>₹{(ev.budget - ev.totalSpent).toLocaleString()}</td>
                                                            <td>
                                                                <div style={{ minWidth: 100 }}>
                                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                                                                    <div className="progress-bar">
                                                                        <div className={`progress-bar-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : ''}`} style={{ width: Math.min(pct, 100) + '%' }} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{statusBadge(ev.status)}</td>
                                                        </tr>
                                                    );
                                                })}
                                                {events.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No events yet</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* REJECT MODAL */}
            {rejectModal.open && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Rejection Reason</h2>
                            <button className="closeModal" onClick={closeRejectModal}><X size={16} /></button>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Please provide a clear reason. This will be sent to the organizer via notification and email.
                        </p>
                        <textarea
                            style={{ width: '100%', minHeight: 100, padding: 12, border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', background: 'var(--bg-input)' }}
                            placeholder="e.g. Budget exceeds approved limits for this event category..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                            <button className="btn btn-ghost" onClick={closeRejectModal}>Cancel</button>
                            <button className="btn btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={handleReject}>
                                <X size={14} /> Send Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIPT PREVIEW */}
            {receiptModal && (
                <div className="modalOverlay" onClick={() => setReceiptModal(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 20, maxWidth: '90vw' }}>
                        <img src={receiptModal} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setReceiptModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}