import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { getAllUsers, getEmployees } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

const useEmployee = (page, limit) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch employees function
    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(limit, page)
            setData(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching employees:', error.response ? error.response.data : error.message);
        }
    };

    const fetchEmpoyeesAccount = async () => {
        try {
            const response = await getAllUsers(limit, page)
            setUsers(response.data.data);
            setUsersTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching employees:', error.response ? error.response.data : error.message);
        }
    };

    // Effect for fetching employees
    useEffect(() => {
        fetchEmployees();
        fetchEmpoyeesAccount();
    }, [page, limit]);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('employeeDataUpdate', (update) => {
            console.log('Update received:', update);
            fetchEmployees();
            fetchEmpoyeesAccount();
        });

        // Cleanup on unmount
        return () => {
            socket.off('employeeDataUpdate');
        };
    }, []);

    return { employee: data, totalPages, users: users, userTotal: usersTotalPages };
};

export default useEmployee;