import Nav from "../components/Nav";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NotificationBar from "../components/NotificationBar";
import { AppContext } from "../context/AppContext.jsx";
import { useContext } from "react";
import BudgetVsSpent from "../components/charts/BudgetVsSpent.jsx";
import CategoryPieChart from "../components/charts/CategoryPieChart.jsx";
import ExpenseTrendLine from "../components/charts/ExpenseTrendLine.jsx";
import {
    LayoutDashboard, CalendarDays, Wallet, CheckCircle, Clock,
    Landmark, Plus, Edit2, Trash2, Upload, Send, Save, X, ArrowRightLeft,
    BarChart2, Camera
} from 'lucide-react';

const API = "http://localhost:4000/api/events";
const CATEGORIES = ['Food', 'Venue', 'Marketing', 'Decoration', 'Entertainment', 'Transport', 'Other'];

const statusBadge = (s) => {
    const map = { pending: 'badge-pending', upcoming: 'badge-upcoming', ongoing: 'badge-ongoing', completed: 'badge-completed', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
};
const expBadge = (s) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
};

export default function OrganizerPanel() {
    const { isSidebarOpen, userData } = useContext(AppContext);
    const [page, setPage] = useState("dashboard");
    const [events, setEvents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [createModal, setCreateModal] = useState(false);
    const [expenseModal, setExpenseModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [reallocModal, setReallocModal] = useState(false);

    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExpenseId, setCurrentExpenseId] = useState(null);
    const [currentEventId, setCurrentEventId] = useState(null);

    const [formData, setFormData] = useState({ name: "", date: "", budget: "" });
    const [expForm, setExpForm] = useState({ category: "Venue", description: "", amount: "", date: "" });
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [reallocForm, setReallocForm] = useState({ requestedAmount: "", message: "" });
    const [previewImg, setPreviewImg] = useState(null);

    const fetchEvents = async () => {
        if (!userData?.name) return;
        try {
            const res = await axios.get(`${API}/all`, { params: { organizerName: userData.name } });
            setEvents(res.data.events || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchAnalytics = async () => {
        if (!userData?.name) return;
        try {
            const res = await axios.get(`${API}/analytics`, { params: { organizerName: userData.name } });
            if (res.data.success) setAnalytics(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (userData?.name) { fetchEvents(); fetchAnalytics(); }
    }, [userData]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/create`, { eventName: formData.name, eventDate: formData.date, budget: parseFloat(formData.budget), organizerId: userData?.name });
            if (res.data.success) {
                fetchEvents(); fetchAnalytics();
                setCreateModal(false);
                setFormData({ name: "", date: "", budget: "" });
                toast.success("Event created! Awaiting admin approval.");
            }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('category', expForm.category);
            fd.append('description', expForm.description);
            fd.append('amount', expForm.amount);
            fd.append('date', expForm.date);
            if (receiptFile) fd.append('receipt', receiptFile);
            const url = isEditing
                ? `${API}/${selectedEventId}/expenses/${currentExpenseId}`
                : `${API}/${selectedEventId}/add-expense`;
            const res = isEditing ? await axios.put(url, fd) : await axios.post(url, fd);
            if (res.data.success) {
                fetchEvents(); fetchAnalytics();
                closeExpenseModal();
                toast.success(isEditing ? "Expense updated!" : "Expense submitted for approval!");
            } else { toast.error(res.data.message); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const closeExpenseModal = () => {
        setExpenseModal(false); setIsEditing(false); setReceiptFile(null); setReceiptPreview(null);
        setExpForm({ category: "Venue", description: "", amount: "", date: "" });
    };

    const openAddExpense = (eventId) => { setSelectedEventId(eventId); setIsEditing(false); setExpenseModal(true); };
    const openEditExpense = (event, expense) => {
        setSelectedEventId(event._id); setCurrentExpenseId(expense._id); setIsEditing(true);
        setExpForm({ category: expense.category, description: expense.description, amount: expense.amount, date: new Date(expense.date).toISOString().split('T')[0] });
        setExpenseModal(true);
    };

    const handleDeleteExpense = async () => {
        try {
            const res = await axios.delete(`${API}/${currentEventId}/expenses/${currentExpenseId}`);
            if (res.data.success) { fetchEvents(); fetchAnalytics(); setDeleteModal(false); toast.success("Expense deleted."); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const handleRealloc = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/${selectedEventId}/reallocation-request`, {
                requestedAmount: parseFloat(reallocForm.requestedAmount),
                message: reallocForm.message
            });
            if (res.data.success) {
                fetchEvents(); setReallocModal(false);
                setReallocForm({ requestedAmount: "", message: "" });
                toast.success("Budget reallocation request sent to admin!");
            } else { toast.error(res.data.message); }
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const openReallocModal = (eventId) => { setSelectedEventId(eventId); setReallocModal(true); };

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) { toast.error("Receipt image must be under 500KB"); return; }
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
    };

    const totalBudget = events.reduce((s, ev) => s + ev.budget, 0);
    const totalSpent = events.reduce((s, ev) => s + ev.totalSpent, 0);
    const pendingAmount = events.reduce((s, ev) => s + ev.expenses.filter(x => x.approvalStatus === 'pending').reduce((a, x) => a + x.amount, 0), 0);
    const remaining = totalBudget - totalSpent;

    const navItems = [
        { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { key: 'my-events', label: 'My Events', Icon: CalendarDays },
    ];

    if (loading) return (
        <>
            <Nav />
            <div className="loading" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        </>
    );

    return (
        <>
            <Nav />
            <div className="organizerContainer">
                <NotificationBar />

                <div className="sidePanel">
                    <div className="sidePanel-logo">
                        <h3>Organizer Panel</h3>
                        <p style={{ fontSize: 12, color: 'var(--sidebar-text)', marginTop: 2 }}>{userData?.name}</p>
                    </div>
                    <div className="sideContent">
                        <ul>
                            {navItems.map(({ key, label, Icon }) => (
                                <li key={key}>
                                    <button className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
                                        <Icon size={16} /> {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mainPanel">
                    <div className="mainContent">

                        {/* DASHBOARD */}
                        {page === 'dashboard' && (
                            <>
                                <div className="page-header">
                                    <div>
                                        <h1>Dashboard</h1>
                                        <p>Welcome back, {userData?.name}. Here's your financial overview.</p>
                                    </div>
                                    <button className="createEventBut" onClick={() => setCreateModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={16} /> New Event
                                    </button>
                                </div>

                                <div className="eventDashContent">
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--primary)', '--card-icon-bg': 'var(--primary-light)', '--card-icon-color': 'var(--primary)' }}>
                                        <div className="card-icon"><Wallet size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Budget</h4>
                                        <h1>₹{totalBudget.toLocaleString()}</h1>
                                        <p className="card-sub">Across {events.length} event{events.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--success)', '--card-icon-bg': 'var(--success-light)', '--card-icon-color': 'var(--success)' }}>
                                        <div className="card-icon"><CheckCircle size={20} strokeWidth={1.75} /></div>
                                        <h4>Total Spent (Approved)</h4>
                                        <h1>₹{totalSpent.toLocaleString()}</h1>
                                        <p className="card-sub">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of total budget</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--warning)', '--card-icon-bg': 'var(--warning-light)', '--card-icon-color': 'var(--warning)' }}>
                                        <div className="card-icon"><Clock size={20} strokeWidth={1.75} /></div>
                                        <h4>Pending Approval</h4>
                                        <h1>₹{pendingAmount.toLocaleString()}</h1>
                                        <p className="card-sub">Awaiting admin review</p>
                                    </div>
                                    <div className="eventdashCard" style={{ '--card-accent': 'var(--info)', '--card-icon-bg': 'var(--info-light)', '--card-icon-color': 'var(--info)' }}>
                                        <div className="card-icon"><Landmark size={20} strokeWidth={1.75} /></div>
                                        <h4>Remaining</h4>
                                        <h1>₹{remaining.toLocaleString()}</h1>
                                        <p className="card-sub">Available budget</p>
                                    </div>
                                </div>

                                {analytics && (
                                    <div className="charts-grid">
                                        <div className="chart-card">
                                            <h3>Budget vs Spent</h3>
                                            <p>Per-event comparison</p>
                                            <BudgetVsSpent data={analytics.perEvent} />
                                        </div>
                                        <div className="chart-card">
                                            <h3>Category Breakdown</h3>
                                            <p>Approved expenses by category</p>
                                            <CategoryPieChart data={analytics.categoryBreakdown} />
                                        </div>
                                        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                            <h3>Expense Trend</h3>
                                            <p>Monthly approved spending over time</p>
                                            <ExpenseTrendLine data={analytics.expenseTrend} />
                                        </div>
                                    </div>
                                )}

                                <div className="section-card" style={{ marginTop: 8 }}>
                                    <h2>Active Events</h2>
                                    {events.length === 0 ? (
                                        <div className="empty-state">
                                            <BarChart2 size={48} style={{ color: 'var(--border)', marginBottom: 12 }} />
                                            <h3>No events yet</h3>
                                            <p>Click "New Event" to get started</p>
                                        </div>
                                    ) : (
                                        <div className="table-wrapper eventScrollDash">
                                            <table id="orgEventTable">
                                                <thead><tr>
                                                    <th>Event</th><th>Date</th><th>Budget</th><th>Spent</th><th>Status</th><th>Progress</th><th>Actions</th>
                                                </tr></thead>
                                                <tbody>
                                                    {events.map(ev => {
                                                        const pct = ev.budget > 0 ? (ev.totalSpent / ev.budget) * 100 : 0;
                                                        return (
                                                            <tr key={ev._id}>
                                                                <td><strong>{ev.eventName}</strong></td>
                                                                <td>{new Date(ev.eventDate).toLocaleDateString('en-IN')}</td>
                                                                <td>₹{ev.budget.toLocaleString()}</td>
                                                                <td>₹{ev.totalSpent.toLocaleString()}</td>
                                                                <td>{statusBadge(ev.status)}</td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                                                                    <div className="progress-bar">
                                                                        <div className={`progress-bar-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : ''}`} style={{ width: Math.min(pct, 100) + '%' }} />
                                                                    </div>
                                                                </td>
                                                                <td><button className="manageBut" onClick={() => setPage('my-events')}>Manage</button></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* MY EVENTS */}
                        {page === 'my-events' && (
                            <>
                                <div className="page-header">
                                    <div><h1>My Events & Expenses</h1><p>Manage expenses for your approved events</p></div>
                                    <button className="createEventBut" onClick={() => setCreateModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={16} /> New Event
                                    </button>
                                </div>

                                {events.length === 0 ? (
                                    <div className="empty-state" style={{ marginTop: 60 }}>
                                        <CalendarDays size={48} style={{ color: 'var(--border)', marginBottom: 12 }} />
                                        <h3>No events yet</h3>
                                        <p>Create an event to start managing expenses</p>
                                    </div>
                                ) : (
                                    <div className="eventScroll">
                                        {events.map(event => {
                                            const pct = event.budget > 0 ? (event.totalSpent / event.budget) * 100 : 0;
                                            const canAddExpense = ['upcoming', 'ongoing'].includes(event.status);
                                            const hasPendingRealloc = event.reallocationRequests?.some(r => r.status === 'pending');

                                            return (
                                                <div key={event._id} className="eventExpenseCard">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                                        <div>
                                                            <h2 style={{ fontSize: 18, marginBottom: 4 }}>{event.eventName}</h2>
                                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                                {new Date(event.eventDate).toLocaleDateString('en-IN')}
                                                                &nbsp;&nbsp;|&nbsp;&nbsp;Budget: ₹{event.budget.toLocaleString()}
                                                                &nbsp;&nbsp;|&nbsp;&nbsp;Spent: ₹{event.totalSpent.toLocaleString()}
                                                            </p>
                                                            {event.rejectionReason && (
                                                                <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Rejection reason: {event.rejectionReason}</p>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            {statusBadge(event.status)}
                                                            {canAddExpense && (
                                                                <>
                                                                    <button className="addExpBut" onClick={() => openAddExpense(event._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                                        <Plus size={14} /> Add Expense
                                                                    </button>
                                                                    {!hasPendingRealloc && (
                                                                        <button className="btn btn-ghost btn-sm" onClick={() => openReallocModal(event._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                                            <ArrowRightLeft size={13} /> Request Reallocation
                                                                        </button>
                                                                    )}
                                                                    {hasPendingRealloc && <span className="badge badge-pending">Reallocation Pending</span>}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: 16 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                                            <span>Budget utilization</span><span>{pct.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="progress-bar" style={{ height: 8 }}>
                                                            <div className={`progress-bar-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : ''}`} style={{ width: Math.min(pct, 100) + '%' }} />
                                                        </div>
                                                    </div>

                                                    {event.reallocationRequests?.length > 0 && (
                                                        <div style={{ marginBottom: 16, background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <ArrowRightLeft size={13} /> Reallocation Requests
                                                            </p>
                                                            {event.reallocationRequests.map(r => (
                                                                <div key={r._id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    <span className={`badge ${r.status === 'approved' ? 'badge-approved' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>{r.status}</span>
                                                                    ₹{r.requestedAmount.toLocaleString()} — {r.message}
                                                                    {r.adminMessage && <span style={{ color: 'var(--text-muted)' }}> | Admin: {r.adminMessage}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {event.expenses?.length > 0 ? (
                                                        <div className="table-wrapper">
                                                            <table id="orgEventTable">
                                                                <thead><tr>
                                                                    <th>Category</th><th>Description</th><th>Date</th><th>Amount</th><th>Receipt</th><th>Status</th><th>Actions</th>
                                                                </tr></thead>
                                                                <tbody>
                                                                    {event.expenses.map(exp => (
                                                                        <tr key={exp._id}>
                                                                            <td><span className="badge badge-upcoming">{exp.category}</span></td>
                                                                            <td style={{ maxWidth: 200 }}>{exp.description}</td>
                                                                            <td>{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                                                                            <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                                                                            <td>
                                                                                {exp.receiptImage
                                                                                    ? <img src={exp.receiptImage} alt="Receipt" className="receipt-preview" onClick={() => setPreviewImg(exp.receiptImage)} />
                                                                                    : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                                                                            </td>
                                                                            <td>
                                                                                {expBadge(exp.approvalStatus)}
                                                                                {exp.rejectionReason && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>Reason: {exp.rejectionReason}</p>}
                                                                            </td>
                                                                            <td>
                                                                                <button className="ExpenceAction" style={{ backgroundColor: 'var(--info)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                                                    disabled={exp.approvalStatus === 'approved'}
                                                                                    onClick={() => openEditExpense(event, exp)}>
                                                                                    <Edit2 size={12} /> Edit
                                                                                </button>
                                                                                <button className="ExpenceAction" style={{ backgroundColor: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                                                    disabled={exp.approvalStatus === 'approved'}
                                                                                    onClick={() => { setCurrentEventId(event._id); setCurrentExpenseId(exp._id); setDeleteModal(true); }}>
                                                                                    <Trash2 size={12} /> Delete
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>
                                                            {canAddExpense ? 'No expenses yet. Click "Add Expense" to start.' : 'Event must be approved by admin before adding expenses.'}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE EVENT MODAL */}
            {createModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Create New Event</h2>
                            <button className="closeModal" onClick={() => setCreateModal(false)}><X size={16} /></button>
                        </div>
                        <form className="modalForm" onSubmit={handleCreateEvent}>
                            <div className="form-group"><label>Event Name</label>
                                <input type="text" placeholder="e.g. Hacknovate 2025" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group"><label>Event Date</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className="form-group"><label>Total Budget (₹)</label>
                                <input type="number" placeholder="e.g. 50000" min="1" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} required />
                            </div>
                            <button type="submit" className="modalSubmitBut" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Send size={15} /> Submit for Admin Approval
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD/EDIT EXPENSE MODAL */}
            {expenseModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                            <button className="closeModal" onClick={closeExpenseModal}><X size={16} /></button>
                        </div>
                        <form className="modalForm" onSubmit={handleExpenseSubmit}>
                            <div className="form-group"><label>Category</label>
                                <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Description</label>
                                <input type="text" placeholder="e.g. Deposit for hall booking" required value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
                            </div>
                            <div className="form-group"><label>Amount (₹)</label>
                                <input type="number" placeholder="e.g. 5000" min="1" required value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
                            </div>
                            <div className="form-group"><label>Date</label>
                                <input type="date" required value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Receipt Image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, max 500KB)</span></label>
                                <div className="receipt-upload-area">
                                    <input type="file" accept="image/*" onChange={handleReceiptChange} />
                                    {receiptPreview ? (
                                        <img src={receiptPreview} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }} alt="Preview" />
                                    ) : (
                                        <>
                                            <Camera size={28} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                            <p>Click to upload receipt image</p>
                                        </>
                                    )}
                                    {receiptFile && <p className="file-name">{receiptFile.name}</p>}
                                </div>
                            </div>
                            <button type="submit" className="modalSubmitBut" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {isEditing ? <><Save size={15} /> Save Changes</> : <><Send size={15} /> Submit for Approval</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {deleteModal && (
                <div className="delcnfm">
                    <div className="msgBox">
                        <h2>Delete Expense?</h2>
                        <p>This action cannot be undone. The expense will be permanently removed.</p>
                        <div className="msgBox-btns">
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteModal(false)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDeleteExpense}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* REALLOCATION MODAL */}
            {reallocModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Request Budget Reallocation</h2>
                            <button className="closeModal" onClick={() => setReallocModal(false)}><X size={16} /></button>
                        </div>
                        <form className="modalForm" onSubmit={handleRealloc}>
                            <div className="form-group">
                                <label>Requested New Budget (₹)</label>
                                <input type="number" placeholder="e.g. 75000" min="1" required value={reallocForm.requestedAmount} onChange={e => setReallocForm({ ...reallocForm, requestedAmount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Reason / Message to Admin</label>
                                <textarea placeholder="Explain why you need additional budget..." required value={reallocForm.message} onChange={e => setReallocForm({ ...reallocForm, message: e.target.value })} />
                            </div>
                            <button type="submit" className="modalSubmitBut" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Send size={15} /> Send Request to Admin
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* IMAGE LIGHTBOX */}
            {previewImg && (
                <div className="modalOverlay" onClick={() => setPreviewImg(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 16, maxWidth: '90vw', maxHeight: '90vh' }}>
                        <img src={previewImg} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setPreviewImg(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}