import { createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    const backendUrl = "http://localhost:4000";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

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

    const value = { backendUrl, isLoggedIn, setIsLoggedIn, userData, setUserData, getUserData, logout, isSidebarOpen, setIsSidebarOpen };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
}
