import Nav from "../components/Nav.jsx"
import {  useContext, useState } from "react"
import axios from "axios"
import { AppContext } from "../context/AppContext.jsx"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

export default function Login() {
    const [role,setRole]=useState("admin");

    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password,role });
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
                toast.success(data.message,{position:"top-center"});
                if(role==='admin')
                    navigate("/admin-panel");
                else
                    navigate('/organizer-panel');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message,{position:"top-center"});
        }
    }
    return <>
        <Nav />
        <div className="loginContainer">
            <h1>Login</h1>
            <div className="switch">
                <div style={{width:"50%"}}>
                    <button  onClick={()=>setRole("admin")} style={{backgroundColor:role==="admin"?"green":"",color:role==="admin"?"white":""}} >Admin</button>
                </div>
                <div style={{width:"50%"}} >
                    <button onClick={()=>setRole("organizer")} style={{backgroundColor:role==="organizer"?"green":"",color:role==="organizer"?"white":""}}  >Organizer</button>
                </div>
            </div>
            <form onSubmit={onSubmitHandler} >
                <label>Email:</label>
                <input onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder="Enter email" required />
                <label>Password:</label>
                <input onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder={role==="admin"?"Enter admin credintial":"Enter organizer credintial"} required />
                <button type="submit" className="submitButton">Login</button>
                <p style={{color:"red",fontSize:"18px",margin:"5px 0px",cursor:"pointer"}} onClick={()=>navigate('/reset-password')} >Forget Password?</p>
                <div style={{marginTop: '10px',fontSize:"18px",display:"flex",gap:"10px"}} className="newuser" >
                    <p>New User?</p>
                    <Link to='/register'>Register</Link>
                </div>
            </form>
        </div>
    </>
}