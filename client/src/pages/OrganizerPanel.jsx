import Nav from "../components/Nav";
import { useState } from "react";
export default function OrganizerPanel() {
    const [pageToogle, setPageToggle] = useState("dashboard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addExpense, setaddExpense] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [formData, setFormData] = useState({ name: "", date: "", budget: "", organizer: "" });
    const [expenseFormData, setExpenseFormData] = useState({ category: "Venue", description: "", amount: "", date: "" });
    const [events, setEvents] = useState([
        { id: 1, name: "Enthusia 2k26", organizer: "Paranjothi", date: "01/26/2026", budget: 17000, spent: 200, progress: 9 },
        { id: 2, name: "Hacknovate 2k26", organizer: "Siva", date: "02/15/2026", budget: 5000, spent: 1000, progress: 17 },
        { id: 2, name: "Swaram 2k26", organizer: "Nithesh", date: "20/15/2026", budget: 50000, spent: 10000, progress: 25 }

    ]);
    const [expenses, setExpenses] = useState([
        { id: 101, eventId: 1, category: "Catering", description: "Snacks for Judges", date: "2026-01-26", amount: 200, status: "Pending" }
    ]);
    const NavtoEvent = () => {
        setPageToggle("my-events");
    }
    const openExpenseModal = (eventId) => {
        setSelectedEventId(eventId);
        setaddExpense(true);
    };
    const handleCreateEvent = (e) => {
        e.preventDefault();

        const newEvent = {
            id: events.length + 1,
            name: formData.name,
            organizer: formData.organizer,
            date: formData.date,
            budget: parseFloat(formData.budget) || 0,
            spent: 0,
            progress: 0
        };

        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        setFormData({ name: "", date: "", budget: "", organizer: "" });
    };
    const handleAddExpense = (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            eventId: selectedEventId,
            category: expenseFormData.category,
            description: expenseFormData.description,
            amount: parseFloat(expenseFormData.amount),
            date: expenseFormData.date,
            status: "Pending"
        };

        setExpenses([...expenses, newExpense]);
        setaddExpense(false);
        setExpenseFormData({ category: "Venue", description: "", amount: "", date: "" });
    };
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
                                        <h1>₹40000.00</h1>
                                        <h4 style={{ color: "rgb(54, 163, 42)", fontWeight: "normal" }} >Allocated across events</h4>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Spent(Approved)</h4>
                                        <h1>₹15000.00</h1>
                                        <div style={{ display: "flex", gap: "3px" }} >
                                            <h4 style={{ width: "fit-content", color: "rgb(54, 163, 42)" }} >14.4% </h4>
                                            <h4 style={{ width: "fit-content", color: "black", fontWeight: "normal" }} >of total budget utilized</h4>
                                        </div>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Pending Approval</h4>
                                        <h1>₹5000.00</h1>
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
                                                <tr key={event.id}>
                                                    <td>
                                                        <strong>{event.name}</strong><br />
                                                        <small style={{ color: "gray", textAlign: "left" }}>{event.organizer}</small>
                                                    </td>
                                                    <td>{event.date}</td>
                                                    <td>₹{event.budget.toLocaleString()}</td>
                                                    <td>₹{event.spent.toLocaleString()}</td>
                                                    <td>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                                            {event.progress}%
                                                            <progress value={event.progress} max="100"></progress>
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
                                    <div key={event.id} className="eventExpenseCard">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h2>{event.name}</h2>
                                                <p>Budget: ₹{event.budget} || <strong>Organizer:</strong> {event.organizer}</p>
                                            </div>
                                            <button className="addExpBut" onClick={() => openExpenseModal(event.id)}>+Add Expense</button>
                                        </div>
                                        <table id="orgEventTable" style={{textAlign:"center"}}>
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
                                                {expenses.filter(ex => ex.eventId === event.id).length > 0 ? (
                                                    expenses.filter(ex => ex.eventId === event.id).map(expense => (
                                                        <tr key={expense.id}>
                                                            <td>{expense.category}</td>
                                                            <td>{expense.description}</td>
                                                            <td>{expense.date}</td>
                                                            <td>₹{expense.amount.toLocaleString()}</td>
                                                            <td>
                                                                <span style={{
                                                                    padding: "4px 8px",
                                                                    borderRadius: "4px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold",
                                                                    backgroundColor: expense.status === "Approved" ? "#dcfce7" : "#fef3c7",
                                                                    color: expense.status === "Approved" ? "#166534" : "#92400e"
                                                                }}>
                                                                    {expense.status}
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
                                <option value="Venue booking">Venue</option>
                                <option value="Catering">Catering</option>
                                <option value="Decorations">Decorations</option>
                                <option value="Refreshment">Refreshment</option>
                                <option value="Others">Others</option>
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