import Nav from "../components/Nav.jsx";
import { useState } from "react";
export default function AdminPanel() {
    const [pageToogle, setPageToggle] = useState("overview");

    const [requests, setRequests] = useState([
        { id: 201, organizer: "Paranjothi", event: "Enthusia 2k26", amount: 5000, description: "Additional Budget for prizes", category: "catering", status: "Pending" },
        { id: 202, organizer: "Siva", event: "Hacknovate 2k26", amount: 2000, description: "Equipment Rental", category: "snacks", status: "Approved" },

    ]);

    const [reports, setReports] = useState([
        { id: 301, event: "Enthusia 2k26", organizer: "paranjothi", budget: 12000, approved: 3000, remaining: 9000 },
        { id: 302, event: "Swaram 2k26", organizer: "siva", budget: 12000, approved: 3000, remaining: 9000 },
        { id: 303, event: "Hacknovate 2k26", organizer: "nithish", budget: 12000, approved: 3000, remaining: 9000 },

    ]);
    return <>
        <Nav />
        <div className="organizerContainer">
            <div className="sidePanel">
                <div className="sideContent">
                    <ul>
                        <li><button onClick={() => setPageToggle("overview")}
                            style={{
                                backgroundColor: pageToogle === 'overview' ? "rgba(0,0,0,0.1)" : ""
                                , color: pageToogle === 'overview' ? "blue" : ""
                            }}  >Overview</button></li>
                        <li><button onClick={() => setPageToggle("approval")}
                            style={{
                                backgroundColor: pageToogle === 'approval' ? "rgba(0,0,0,0.1)" : ""
                                , color: pageToogle === 'approval' ? "blue" : ""
                            }}  >Approvals</button></li>
                        <li><button onClick={() => setPageToggle("reports")}
                            style={{
                                backgroundColor: pageToogle === 'reports' ? "rgba(0,0,0,0.1)" : ""
                                , color: pageToogle === 'reports' ? "blue" : ""
                            }}  >Report</button></li>
                    </ul>
                </div>
            </div>
            <div className="mainPanel">
                <div className="mainContent">
                    {pageToogle === "overview" &&
                        <>
                            <div className="eventDash">
                                <h1 >Financial Overview</h1>
                                <div className="eventDashContent">
                                    <div className="eventdashCard">
                                        <h4>Total Event</h4>
                                        <h1>2</h1>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Pending Requests</h4>
                                        <h1 style={{ color: "orange" }} >1</h1>
                                    </div>
                                    <div className="eventdashCard">
                                        <h4>Total Distribution</h4>
                                        <h1>₹40000</h1>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {pageToogle === "approval" &&
                        <>
                            <div className="myEventsPage">
                                <h1>Approval Queue</h1>
                                <div className="allEventExpense">
                                    <div className="eventExpenseCard">
                                        {requests.length > 0 ? (
                                            <table id="orgEventTable" style={{ textAlign: "center" }}>
                                                <thead>
                                                    <tr>
                                                        <th>Event</th>
                                                        <th>Organizer</th>
                                                        <th>Category</th>
                                                        <th>Description</th>
                                                        <th>Amount</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {requests.map((e) => (

                                                        <tr key={e.id}>
                                                            <td>{e.event}</td>
                                                            <td>{e.organizer}</td>
                                                            <td>{e.category}</td>
                                                            <td>{e.description}</td>
                                                            <td>{e.amount}</td>
                                                            <td><button id="approveBut" >Approve</button>
                                                                <button id="rejectBut" >Reject</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>) : <h3 style={{ textAlign: "center", marginTop: "20px" }} >No Pending Requests</h3>}
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {
                        pageToogle === "reports" &&
                        <>
                            <div className="myEventsPage">
                                <div style={{display:"flex",justifyContent:"space-between",alignContent:"center"}} >
                                    <h1>Financial Reports</h1>
                                    <button 
                                        style={{padding:"5px 10px",borderRadius:"5px",fontSize:"14px",cursor:"pointer"}}
                                        onClick={()=>window.print()}
                                    >Print report </button>
                                </div>
                                <div style={{ margin: "20px 0px" }} className="eventExpenseCard">
                                    <h2>All Events Budget Status</h2>
                                    {reports.length > 0 ? (
                                        <table id="orgEventTable" style={{ textAlign: "center" }}>
                                            <thead>
                                                <tr>
                                                    <th>Event Name</th>
                                                    <th>Organizer</th>
                                                    <th>Budget</th>
                                                    <th>Commited(Approved)</th>
                                                    <th>Remaining</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map((e) => (

                                                    <tr key={e.id}>
                                                        <td>{e.event}</td>
                                                        <td>{e.organizer}</td>
                                                        <td>{e.budget}</td>
                                                        <td>{e.approved}</td>
                                                        <td>{e.remaining}</td>
                                                        <td><button id="approveBut" >On track</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>) : <h3 style={{ textAlign: "center", marginTop: "20px" }} >No Report</h3>}

                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    </>
}