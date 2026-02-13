import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
export default function Nav() {
    const { userData, isLoggedIn,logout} = React.useContext(AppContext);
    const navigate=useNavigate();
    const handlelogout=()=>{
        logout();
        navigate('/');
    }
    return <>
        <div className="navContainer">
            <h1>Eventify</h1>
            <div className="nav-links">
                <ul><li><Link to='/' style={{padding:"10px"}} >Home</Link></li></ul>
                {isLoggedIn && userData ? (
                    <span className="roleName" style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {userData.role === 'admin' ? 'Admin Login' : 'Organizer Login'}
                    </span>
                ): (<ul><li><Link to='/login' >Login</Link></li></ul>)}
                { isLoggedIn&& <ul><li><button className="logoutButton" onClick={handlelogout}>Logout</button></li></ul>}
            </div>
        </div>
    </>
}