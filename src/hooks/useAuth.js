'use strict';
import { checkToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [auth, setAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isTokenChecked, setIsTokenChecked] = useState(false);
    const router = useRouter();

    const getToken = async () => {
        try {
            const res = await checkToken();
            if (res.status === 200) {
                setToken(true);
            } else {
                setToken(false);
            }
        } catch (e) {
            setToken(false);
        } finally {
            setIsTokenChecked(true);
        }
    };

    useEffect(() => {
        let localStorageUser;
        let localStorageAdmin;

        if (typeof window !== 'undefined') {
            localStorageUser = JSON.parse(localStorage.getItem('user'));
            localStorageAdmin = JSON.parse(localStorage.getItem('admin'));
            getToken();

            // Set user if exists in localStorage, otherwise set admin
            const userToSet = localStorageUser ? { ...localStorageUser, status: 'user' } : { ...localStorageAdmin, status: 'admin' };
            setUser(userToSet);
        }
    }, []);

    useEffect(() => {
        if (isTokenChecked) {
            console.log('Token checked:', token);
            if (token) {
                setAuth(true);
            } else {
                router.push("/");
            }
        }
    }, [isTokenChecked, token, router]);

    return { auth, user, token };
};

export default useAuth;