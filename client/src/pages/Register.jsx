import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Nav from '../components/Nav.jsx';
export default function Register() {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('organizer');
    const [key, setKey] = useState('');

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            let  response ;
            if (role === 'admin') {
                 response  = await axios.post(backendUrl + '/api/auth/register', { name, email, password, role, key });
            }
            else {
                 response  = await axios.post(backendUrl + '/api/auth/register', { name, email, password, role });
            }
            const {data}=response;
            if (data.success) {
                toast.success("Account created! Please Login.", { position: "top-center" });
                navigate('/login');
            } else {
                toast.error(data.message, { position: "top-center" });
            }
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        }
    };

    return (
        <>
            <Nav />
            <div className="loginContainer">
                <h1>Register</h1>
                <form onSubmit={onSubmitHandler}>
                    <label  >Role:</label>
                    <select className='roleSelect' value={role} onChange={e => setRole(e.target.value)} >
                        <option value="organizer" >Organizer</option>
                        <option value="admin" >Admin</option>
                    </select>
                    {role === 'admin' &&
                        <>
                            <label>Admin Key:</label>
                            <input onChange={e => setKey(e.target.value)} value={key} type="password" placeholder='Enter Admin Key'   required />
                        </>
                    }
                    <label>Username</label>
                    <input onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Enter name' required />

                    <label>Email:</label>
                    <input onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Enter email' required />

                    <label>Password:</label>
                    <input onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Enter password' required />

                    <button type='submit' className='submitButton' >Register</button>
                    <div style={{ marginTop: '10px', fontSize: "18px", display: "flex", gap: "10px" }} className="newuser" >
                        <p>Already a User?</p>
                        <Link to='/login'>Login</Link>
                    </div>
                </form>
            </div>
        </>
    );
}