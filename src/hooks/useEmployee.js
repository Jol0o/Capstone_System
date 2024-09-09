import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { getEmployees } from '@/lib/api';

const socket = io('http://localhost:8080');

const useEmployee = (page, limit) => {
    const [data, setData] = useState([]);
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

    // Effect for fetching employees
    useEffect(() => {
        fetchEmployees();
    }, [page, limit]);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('employeeDataUpdate', (update) => {
            console.log('Update received:', update);
            fetchEmployees();
        });

        // Cleanup on unmount
        return () => {
            socket.off('employeeDataUpdate');
        };
    }, []);

    return { employee: data, totalPages };
};

export default useEmployee;