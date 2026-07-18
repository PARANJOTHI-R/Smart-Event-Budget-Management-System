import { createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    const backendUrl = "https://smart-event-budget-management-system.onrender.com";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data');
            if (data.success) {
                setUserData(data.userData);
            }
        } catch (error) {
            toast.error(error.message,{position:"top-center"});
        }
    }

    const getAuthState = async () => {
    try {
        const { data } = await axios.post(backendUrl + '/api/auth/is-auth');
        if (data.success) {
            setIsLoggedIn(true);
            await getUserData();
        }
    } catch (error) {
        // silent by design, but at least log it while debugging
        console.error("Auth check failed:", error.message);
    } finally {
        setAuthChecked(true);   // NEW — runs whether auth succeeded or failed
    }
}

    const logout = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/logout');
            if (data.success) {
                setIsLoggedIn(false);
                setUserData(null);
                toast.success(data.message,{position:"top-center"});
            }
        } catch (error) {
            toast.error(error.message,{position:"top-center"});
        }
    }

    useEffect(() => {
        getAuthState();
    }, []);

    const value = { authChecked, backendUrl, isLoggedIn, setIsLoggedIn, userData, setUserData, getUserData, logout, isSidebarOpen, setIsSidebarOpen };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
}
