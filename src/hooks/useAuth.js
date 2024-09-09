'use strict';
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [auth, setAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        if (typeof window !== 'undefined') {
            // Now we are in the client-side context
            return localStorage.getItem('token');
        }
        return null;
    });

    useEffect(() => {
        let localStorageUser;
        let localStorageAdmin;

        if (typeof window !== 'undefined') {
            localStorageUser = JSON.parse(localStorage.getItem('user'));
            localStorageAdmin = JSON.parse(localStorage.getItem('admin'));


            // Set user if exists in localStorage, otherwise set admin
            const userToSet = localStorageUser ? { ...localStorageUser, status: 'user' } : { ...localStorageAdmin, status: 'admin' };
            setUser(userToSet);
            if (userToSet) {
                setAuth(true);
            }
        }
    }, []);

    return { auth, user, token };
};

export default useAuth;