import React from 'react'
import Nav from '../components/Nav.jsx'
import { Navigate, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
export default function Home() {
    const { isLoggedIn, logout,userData } = useContext(AppContext);
    const navigation = useNavigate();

    const handleClick=()=>{
        if(userData.role==='admin'){
            navigation('/admin-panel');
        }else if(userData.role==='organizer'){
            navigation('/organizer-panel')
        }
    }

    const redirect = () => {
        navigation('/login');
    }
    return <>
        <Nav />
        <div className="homeContainer">
            <h1>Welcome to Eventify!</h1>
            <p>Your ultimate event budget management solution.</p>
            <div>
                {isLoggedIn ? (
                    <button className="startBut" onClick={handleClick}>Back to dashboard</button>
                ) : (
                    <button className="startBut" onClick={redirect}>Get Started</button>
                )}
            </div>
        </div>
    </>
}