import Nav from "../components/Nav";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"
export default function OrganizerPanel() {
    const API_BASE_URL = "http://localhost:4000/api/events";
    const [pageToogle, setPageToggle] = useState("dashboard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addExpense, setaddExpense] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [formData, setFormData] = useState({ name: "", date: "", budget: "", organizer: "" });
    const [expenseFormData, setExpenseFormData] = useState({ category: "Venue", description: "", amount: "", date: "" });


    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            setEvents(response.data.events);
            setLoading(false);
        }
        catch (error) {
            console.error("Error fetching events:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                eventName: formData.name,
                eventDate: formData.date,
                budget: parseFloat(formData.budget),
                organizerId: formData.organizer 
            };

            const response = await axios.post(`${API_BASE_URL}/create`, payload);
            if (response.data.success) {
                fetchEvents();
                setEvents([...events, response.data.event]);
                setIsModalOpen(false);
                setFormData({ name: "", date: "", budget: "", organizer: "" });
                toast.success("Event created successfully!", { position: "top-center" });
            }

        }
        catch (error) {
            toast.error("Error creating event: " + error.message, { position: "top-center" });
        }
    }

    const NavtoEvent = () => {
        setPageToggle("my-events");
    }
    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                category: expenseFormData.category,
                description: expenseFormData.description,
                amount: parseFloat(expenseFormData.amount),
                date: expenseFormData.date
            };

            const response = await axios.post(`${API_BASE_URL}/${selectedEventId}/add-expense`, payload);
            if (response.data.success) {
                fetchEvents();
                setaddExpense(false);
                setExpenseFormData({ category: "Venue", description: "", amount: "", date: "" });
                toast.success("Expense added successfully!", { position: "top-center" });
            }
        } catch (error) {
            toast.error("Error adding expense: " + error.message, { position: "top-center" });
        }
    };
    const totalBudget = events.reduce((sum, ev) => sum + ev.budget, 0);
    const totalSpent = events.reduce((sum, ev) => sum + ev.totalSpent, 0);

    const openExpenseModal = (eventId) => {
        setSelectedEventId(eventId);
        setaddExpense(true);
    };
    const pendingAmount = events.reduce((sum, event) => {
        const eventPending = event.expenses
            .filter(exp => exp.approvalStatus === 'pending')
            .reduce((s, exp) => s + exp.amount, 0);
        return sum + eventPending;
    }, 0);
    if (loading) {
        return <>
            <div className="loading" > Loading Dashboard...</div>
        </>
    }

    return <>
        <Nav />
        <div className="organizerContainer">
            <div className="sidePanel">
                <div className="sideContent">
                    <ul>
                        <li><button onClick={() => setPageToggle("dashboard")}
                            style={{
                                backgroundColor: pageToogle === 'dashboard' ? "rgba(0,0,0,0.1)" : ""
                                , color: pageToogle === 'dashboard' ? "blue" : ""
                            }}  >Dashboard</button></li>
                        <li><button onClick={() => setPageToggle("my-events")}
                            style={{
                                backgroundColor: pageToogle === 'my-events' ? "rgba(0,0,0,0.1)" : ""
                                , color: pageToogle === 'my-events' ? "blue" : ""
                            }}  >My Events</button></li>
                    </ul>
                </div>
            </div>
            <div className="mainPanel">
                <div className="mainContent">
                    {pageToogle === "dashboard" &&
                        <>
                            <div className="eventDash">
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px" }} >
                                    <h1>Organizer Dashboard</h1>
                                    <button className="createEventBut" onClick={() => setIsModalOpen(true)} >+ New Event</button>
                                </div>
                                <div className="eventDashContent">
                                    <div className="eventdashCard">
                                        <h4>Total Budget</h4>
                                        <h1>₹{totalBudget.toLocaleString()}</h1>
                                        <h4 style={{ color: "rgb(54, 163, 42)", fontWeight: "normal" }} >Allocated across events</h4>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Spent(Approved)</h4>
                                        <h1>₹{totalSpent.toLocaleString()}</h1>
                                        <div style={{ display: "flex", gap: "3px" }} >
                                            <h4 style={{ width: "fit-content", color: "rgb(54, 163, 42)" }} >{(totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0)}% </h4>
                                            <h4 style={{ width: "fit-content", color: "black", fontWeight: "normal" }} >of total budget utilized</h4>
                                        </div>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Pending Approval</h4>
                                        <h1>₹{pendingAmount.toLocaleString()}</h1>
                                        <h4 style={{ color: "black", fontWeight: "normal" }} >Awaiting Admin Review</h4>
                                    </div>
                                </div>
                                <div className="activeEvents">
                                    <h2>Active Events</h2>
                                    <table id="orgEventTable">
                                        <thead>
                                            <tr>
                                                <th>Event Name</th>
                                                <th>Date</th>
                                                <th>Budget</th>
                                                <th>Spent</th>
                                                <th>Progress</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ textAlign: "center" }} >
                                            {events.map((event) => (
                                                <tr key={event._id}>
                                                    <td>
                                                        <strong>{event.eventName}</strong><br />
                                                        <small style={{ color: "gray", textAlign: "left" }}>

                                                            {event.organizer?.name || event.organizer}
                                                        </small>
                                                    </td>
                                                    <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                                    <td>₹{event.budget.toLocaleString()}</td>
                                                    <td>₹{event.totalSpent.toLocaleString()}</td>
                                                    <td>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                                            {event.budget > 0 ? ((event.totalSpent / event.budget) * 100).toFixed(0) : 0}%
                                                            <progress value={event.totalSpent} max={event.budget}></progress>
                                                        </div>
                                                    </td>
                                                    <td><button className="manageBut" onClick={NavtoEvent} >Manage</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>}
                    {pageToogle === "my-events" && <>
                        <div className="myEventsPage">
                            <h1>Event Expenses</h1>
                            <div className="allEventExpense">
                                {events.map((event) => (
                                    <div key={event._id} className="eventExpenseCard"> 
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h2>{event.eventName}</h2> 
                                                <p>Budget: ₹{event.budget} || <strong>Organizer:</strong> {event.organizer?.name || event.organizer}</p>
                                            </div>
                                            <button className="addExpBut" onClick={() => openExpenseModal(event._id)}>+Add Expense</button>
                                        </div>
                                        <table id="orgEventTable" style={{ textAlign: "center" }}>
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Description</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                {event.expenses && event.expenses.length > 0 ? (
                                                    event.expenses.map(expense => (
                                                        <tr key={expense._id}>
                                                            <td>{expense.category}</td>
                                                            <td>{expense.description}</td>
                                                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                                                            <td>₹{expense.amount.toLocaleString()}</td>
                                                            <td>
                                                                <span style={{
                                                                    padding: "4px 8px",
                                                                    borderRadius: "4px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold",

                                                                    backgroundColor: expense.approvalStatus === "approved" ? "#dcfce7" : "#fef3c7",
                                                                    color: expense.approvalStatus === "approved" ? "#166534" : "#92400e"
                                                                }}>
                                                                    {expense.approvalStatus}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" style={{ color: "gray" }}>No expenses added yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>


        {isModalOpen && (
            <div className="modalOverlay">
                <div className="modalContent">
                    <div className="modalHeader">
                        <h2>Create New Event</h2>
                        <button className="closeModal" onClick={() => setIsModalOpen(false)}>&times;</button>
                    </div>
                    <form className="modalForm" onSubmit={handleCreateEvent} >
                        <label>Event Name</label>
                        <input type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Hacknovate" required />

                        <label>Event Date</label>
                        <input type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required />

                        <label>Total Budget (₹)</label>
                        <input type="number"
                            placeholder="Enter amount"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            required />

                        <label>Organizer Name</label>
                        <input type="text"
                            placeholder="Ram"
                            value={formData.organizer}
                            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                            required />

                        <button type="submit" className="modalSubmitBut">Create Event</button>
                    </form>
                </div>
            </div>
        )}





        {addExpense &&
            <>
                <div className="modalOverlay">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Add Expense</h2>
                            <button className="closeModal" onClick={() => setaddExpense(false)}>&times;</button>
                        </div>
                        <form className="modalForm" onSubmit={handleAddExpense} >
                            <label>Event Category</label>
                            <select
                                value={expenseFormData.category}
                                onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                                style={{
                                    padding: "12px", border: " 1px solid #ddd",
                                    borderRadius: "8px",
                                    fontSize: "16px"
                                }}>
                                <option value="Food">Food</option>
                                <option value="Venue">Venue</option>
                                <option value="Decoration">Decoration</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Other">Other</option>
                            </select>
                            <label>Description</label>
                            <input type="text"
                                required
                                placeholder="e.g Deposite for hall booking"
                                value={expenseFormData.description}
                                onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })} />
                            <label>Amount (₹)</label>
                            <input type="number"
                                placeholder="Enter amount"
                                value={expenseFormData.amount}
                                onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                                required />
                            <label>Date</label>
                            <input type="date"
                                required
                                value={expenseFormData.date}
                                onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })} />
                            <button type="submit" className="modalSubmitBut">Submit for Approval</button>
                        </form>
                    </div>
                </div>
            </>

        }

    </>
}