// utils/api.js
import axios from "axios";
import { cache } from "react";

export const API_URL = "http://localhost:8080";

export const getEmployees = async (limit, page) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/employees?page=${page}&limit=${limit}`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getEmployeebyEmail = async (email) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/employee/${email}`);
    if (response) {
        return response;
    } else {
        return null;
    }
}

export const getEmployeeById = async (id) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/employees/${id}`);
    if (response.status === 200) {
        return response.data;
    } else {
        return null;
    }
}

export const sendEmailToEmployee = async (item) => {
    axios.defaults.withCredentials = true;
    await axios.post(`${API_URL}/api/send_email`, {
        qrcode: item.qrcode,
        email: item.email,
    });
}

export const editEmployeeData = async (userData) => {
    axios.defaults.withCredentials = true;
    await axios.put(`${API_URL}/api/employees/${userData.id}`, userData);
}

export const removeEmployee = async (id) => {
    axios.defaults.withCredentials = true;
    const response = await axios.delete(`${API_URL}/api/employee/${id}`);
}

export const getAttendance = async (page, limit) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/attendances?page=${page}&limit=${limit}`)
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const removeAttendance = async (id) => {
    axios.defaults.withCredentials = true;
    axios.delete(`${API_URL}/api/attendance/${id}`)
}

//for analytics api

export const getEarlyBirds = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/early_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getLateEmployees = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/late_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getEarlyDepartures = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/early_departures`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getAbsents = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/absent_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getOff = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/off`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getMonthlyEmployees = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/monthly_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}


export const getMonthlyAttendance = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/monthly_attendance`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getYearlyAttendance = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/yearly_attendance`);
    console.log(response)
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

//api for payroll
export const getPayrolls = async (page, limit) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/payroll?page=${page}&limit=${limit}`)
    if (response) {

        return response;
    } else {
        return null;
    }
}

export const getUserPayroll = async (page, limit, id) => {
    if (!id) {
        console.error('Error: User ID is undefined');
        return null;
    }
    axios.defaults.withCredentials = true;
    try {
        const response = await axios.get(`${API_URL}/api/payroll/${id}?page=${page}&limit=${limit}`);
        if (response) {
            return response;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user payroll:', error);
        return null;
    }
};

export const removePayroll = async (id) => {
    axios.defaults.withCredentials = true;
    axios.delete(`${API_URL}/api/payroll/${id}`)
}

//api authentication methods
export const loginAdmin = async (userForm) => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/auth/admin/login`, {
        email: userForm.email,
        password: userForm.password,
    })
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const loginEmployeeApi = async (userForm) => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: userForm.email,
        password: userForm.password,
    })
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const registerUserAdmin = async (userForm) => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: userForm.email,
        password: userForm.password,
        user_id: userForm.user_id
    })
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const registerAdminAcc = async (userForm) => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/auth/admin/register`, {
        email: userForm.email,
        password: userForm.password,
    })
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
}

export const getUserByQrCode = async (result) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/employees/${encodeURIComponent(result)}`);
    if (response) {
        return response;
    } else {
        return null;
    }
}

export const logoutUser = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/auth/logout`);
}

//leave request route
export const leaveRequest = async (data) => {
    axios.defaults.withCredentials = true;
    const response = await axios.post(`${API_URL}/api/leave_request`, data);
    return response;
}

export const getLeaveRequests = async (page, limit) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/leave_request?page=${page}&limit=${limit}`);
    return response;
}

export const updateLeaveStatus = async (id,status) => {
    console.log(id, status)
    axios.defaults.withCredentials = true;
    const response = await axios.put(`${API_URL}/api/leave_request/${id}/status`, {status});
    return response;
}

export const userRequests = async (status) => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/user_request`, status);
    return response;
}

export const checkToken = async () => {
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${API_URL}/api/auth/check-token`)
    return response;
}