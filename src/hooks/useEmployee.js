import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { getAllUsers, getEmployeeRequest, getEmployees } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

const useEmployee = (page, limit, employeePage) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [employeeTotalPages, setEmployeeTotalPages] = useState(0);
    const [employeeData, setEmployeeData] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch employees function
    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(limit, page)
            setData(response.data.data);
            console.log('Users:', response.data.data);
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

    const fetchEmployeeRequest = async () => {
        try {
            const res = await getEmployeeRequest(limit, employeePage);
            if (res.status === 200) {
                setEmployeeData(res.data.data);
                setEmployeeTotalPages(res.data.totalPages);
            } else {
                console.error('Failed to fetch employee data:', res.status, res.statusText);
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    // Effect for fetching employees
    useEffect(() => {
        fetchEmployees();
        fetchEmpoyeesAccount();
        fetchEmployeeRequest()
    }, [page, limit, employeePage]);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('employeeRequestUpdate', (update) => {
            fetchEmployeeRequest()
        });

        // Cleanup on unmount
        return () => {
            socket.off('employeeRequestUpdate');
        };
    }, []);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('employeeDataUpdate' || 'employeeRequestUpdate', (update) => {
            console.log('Update received:', update);
            fetchEmployees();
            fetchEmpoyeesAccount();
            fetchEmployeeRequest()
        });

        // Cleanup on unmount
        return () => {
            socket.off('employeeDataUpdate');
        };
    }, []);

    return { employee: data, totalPages, users: users, userTotal: usersTotalPages, requests: employeeData, employeeTotal: employeeTotalPages };
};

export default useEmployee;