// utils/api.js
import axios from "axios";
import { cache } from "react";

export const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';

console.log(API_URL);

const axiosInstance = axios.create({
    withCredentials: true,
});

const cacheWrapper = (fn) => cache(async (...args) => {
    const response = await fn(...args);
    return response;
});

export const getEmployees = cacheWrapper(async (limit, page) => {
    const response = await axiosInstance.get(`${API_URL}/api/employees?page=${page}&limit=${limit}`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getEmployeebyEmail = cacheWrapper(async (email) => {
    const response = await axiosInstance.get(`${API_URL}/api/employee/${email}`);
    if (response) {
        return response;
    } else {
        return null;
    }
});

export const getEmployeeById = cacheWrapper(async (id) => {
    const response = await axiosInstance.get(`${API_URL}/api/employees/${id}`);
    if (response.status === 200) {
        return response.data;
    } else {
        return null;
    }
});

export const sendEmailToEmployee = async (item) => {
    await axiosInstance.post(`${API_URL}/api/send_email`, {
        qrcode: item.qrcode,
        email: item.email,
    });
};

export const editEmployeeData = async (userData) => {
    await axiosInstance.put(`${API_URL}/api/employees/${userData.id}`, userData);
};

export const removeEmployee = async (id) => {
    await axiosInstance.delete(`${API_URL}/api/employee/${id}`);
};

export const getAttendance = cacheWrapper(async (page, limit) => {
    const response = await axiosInstance.get(`${API_URL}/api/attendances?page=${page}&limit=${limit}`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const removeAttendance = async (id) => {
    await axiosInstance.delete(`${API_URL}/api/attendance/${id}`);
};

// for analytics api
export const getEarlyBirds = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/early_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getLateEmployees = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/late_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getEarlyDepartures = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/early_departures`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getAbsents = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/absent_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getOff = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/off`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getMonthlyEmployees = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/monthly_employees`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getMonthlyAttendance = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/monthly_attendance`);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getYearlyAttendance = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/yearly_attendance`);
    console.log(response);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

// api for payroll
export const getPayrolls = cacheWrapper(async (page, limit) => {
    const response = await axiosInstance.get(`${API_URL}/api/payroll?page=${page}&limit=${limit}`);
    if (response) {
        return response;
    } else {
        return null;
    }
});

export const getUserPayroll = cacheWrapper(async (page, limit, id) => {
    if (!id) {
        console.error('Error: User ID is undefined');
        return null;
    }
    try {
        const response = await axiosInstance.get(`${API_URL}/api/payroll/${id}?page=${page}&limit=${limit}`);
        if (response) {
            return response;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user payroll:', error);
        return null;
    }
});

export const removePayroll = async (id) => {
    await axiosInstance.delete(`${API_URL}/api/payroll/${id}`);
};

// api authentication methods
export const loginAdmin = async (userForm) => {
    const response = await axiosInstance.post(`${API_URL}/api/auth/admin/login`, {
        email: userForm.email,
        password: userForm.password,
    });
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
};

export const loginEmployeeApi = async (userForm) => {
    const response = await axiosInstance.post(`${API_URL}/api/auth/login`, {
        email: userForm.email,
        password: userForm.password,
    });
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
};

export const registerUser = async (userForm) => {
    const response = await axiosInstance.post(`${API_URL}/api/auth/register`, {
        email: userForm.email,
        password: userForm.password,
        phone_number: userForm.phone,
        name: userForm.name,
    });
    if (response.status === 200) {
        return response;
    } else {
        return response;
    }
};

export const registerAdminAcc = async (userForm) => {
    const response = await axiosInstance.post(`${API_URL}/api/auth/admin/register`, {
        email: userForm.email,
        password: userForm.password,
    });
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
};

export const getUserByQrCode = cacheWrapper(async (result) => {
    const response = await axiosInstance.get(`${API_URL}/api/employees/${encodeURIComponent(result)}`);
    if (response) {
        return response;
    } else {
        return null;
    }
});

export const logoutUser = async () => {
    await axiosInstance.post(`${API_URL}/api/auth/logout`);
};

// leave request route
export const submitRequest = async (data) => {
    const response = await axiosInstance.post(`${API_URL}/api/leave_request`, data);
    return response;
};

export const getLeaveRequests = cacheWrapper(async (limit, page) => {
    const response = await axiosInstance.get(`${API_URL}/api/leave_request?page=${page}&limit=${limit}`);
    return response;
});

export const updateLeaveStatus = async (id, status) => {
    console.log(id, status);
    const response = await axiosInstance.put(`${API_URL}/api/leave_request/${id}/status`, { status });
    return response;
};

export const userRequests = cacheWrapper(async (status) => {
    const response = await axiosInstance.get(`${API_URL}/api/user_request`, status);
    return response;
});

export const checkToken = cacheWrapper(async () => {
    const response = await axiosInstance.get(`${API_URL}/api/auth/check-token`);
    return response;
});

export const getAllUsers = cacheWrapper(async (limit, page) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/api/get-users?page=${page}&limit=${limit}`);
        return response;
    } catch (error) {
        throw error;
    }
});

export const removeUserById = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/api/delete-user/${id}`);
    return response;
};

// search routes
export const searchEmployee = cacheWrapper(async (search) => {
    const response = await axiosInstance.get(`${API_URL}/api/search_employee?q=${search}`);
    return response;
});

export const searchAttendance = cacheWrapper(async (search) => {
    const response = await axiosInstance.get(`${API_URL}/api/search_attendance?q=${search}`);
    return response;
});

export const searchPayroll = cacheWrapper(async (search) => {
    const response = await axiosInstance.get(`${API_URL}/api/search_payroll?q=${search}`);
    return response;
});

export const searchLeaveRequest = cacheWrapper(async (search) => {
    const response = await axiosInstance.get(`${API_URL}/api/search_leave_request?q=${search}`);
    return response;
});

// employee requests route
export const getEmployeeRequest = cacheWrapper(async (limit, page) => {
    const response = await axiosInstance.get(`${API_URL}/api/employee-requests?page=${page}&limit=${limit}`);
    return response;
});

export const approveEmployeeRequest = async (id, employee_id, department, position, baseSalary, qrcode, hierarchy) => {
    try {
        console.log(id, employee_id, department, position, baseSalary, hierarchy, qrcode)
        const response = await axiosInstance.post(`${API_URL}/api/employee-requests/${id}/approve`, {
            employee_id,
            qrcode,
            department,
            position,
            baseSalary,
            hierarchy
        });
        console.log('Employee request approved:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error approving employee request:', error);
        throw error;
    }
};

export const removeEmployeeRequest = async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/api/employee-requests/${id}`);
        return response.data;
    } catch (error) {
        throw error.message;
    }
}

//admin function
export const getAdmins = cacheWrapper(async (limit, page) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/api/admins?page=${page}&limit=${limit}`);
        return response;
    } catch (error) {
        console.error('Error fetching admins:', error);
        throw error; // Re-throw the error to be handled by the calling function
    }
});

export const updateAdmin = async (id, data) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/api/admin/${id}`, data);
        return response;
    } catch (e) {
        throw e;
    }
};

export const removeAdmin = async (id) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/api/admin/${id}`);
        return res
    } catch (e) {
        throw e;
    }
}