import { useContext, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgetPassword from './pages/ResetPassword.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { AppContextProvider } from './context/AppContext.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import OrganizerPanel from './pages/OrganizerPanel.jsx'
import { AppContext } from './context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'


function AppContent() {
  const { isLoggedIn } = useContext(AppContext);
  return <>

    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/reset-password' element={<ForgetPassword />} />
      {isLoggedIn && <Route path='/admin-panel' element={<AdminPanel />} />}
      {isLoggedIn && <Route path='/organizer-panel' element={<OrganizerPanel />} />}
    </Routes>
  </>
}

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <AppContextProvider>
          <AppContent />
        </AppContextProvider>
      </BrowserRouter>
    </>
  )
}

export default App
