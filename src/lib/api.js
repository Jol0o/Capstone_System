// utils/api.js
import axios from "axios";
import { cache } from "react";

export const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';

console.log(API_URL);

const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
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

export const getAttendance = cacheWrapper(async (page, limit, startDate, endDate,) => {
    console.log(page)
    const response = await axiosInstance.get(`${API_URL}/api/attendances`, {
        params: {
            startDate,
            endDate,
            page,
            limit
        }
    });
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

export const getUserAttendance = cacheWrapper(async (id, startDate, endDate, page, limit) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/api/user-attendance/${id}`, {
            params: {
                startDate,
                endDate,
                page,
                limit
            }
        });
        if (response.status === 200) {
            return response; // Return the data directly
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user attendance:', error);
        return null;
    }
});

export const getAllUserAttendances = cacheWrapper(async (startDate, endDate) => {
    try {
        const res = await axiosInstance.get(`${API_URL}/api/import-attendance`, {
            params: {
                startDate,
                endDate,
            }
        })
        return res
    } catch (err) {
        return err
    }
})

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

export const getMonthlyAttendance = cacheWrapper(async (month, year) => {
    const response = await axiosInstance.get(`${API_URL}/api/monthly_attendance`, {
        params: { month, year }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        return null;
    }
});

export const getYearlyAttendance = cacheWrapper(async (year) => {
    const response = await axiosInstance.get(`${API_URL}/api/yearly_attendance`, {
        params: { year }
    });
    console.log(response);
    if (response.status === 200) {
        return response;
    } else {
        return null;
    }
});

// api for payroll
export const getPayrolls = cacheWrapper(async (page, limit, startDate, endDate) => {
    const response = await axiosInstance.get(`${API_URL}/api/payroll`, {
        params: {
            startDate,
            endDate,
            page,
            limit
        }
    });
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

export const exportPayroll = cacheWrapper(async (startDate, endDate) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/api/export-payroll`, {
            params: {
                startDate,
                endDate,
            }
        });
        return response;
    } catch (error) {
        return null;
    }
})

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
        name: userForm.name,
        email: userForm.email,
        position: userForm.position,
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

export const removeLeaveRequest = async (id) => {
    const res = await axiosInstance.delete(`${API_URL}/api/leave_request/${id}`)
    return res
}

export const updateLeaveStatus = async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/api/leave_request/${id}/status`, data);
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

export const approveEmployeeRequest = async (id, employee_id, department, position, basicSalary, qrcode, hierarchy, leaveCredits) => {
    try {
        console.log(id, employee_id, department, position, basicSalary, hierarchy, qrcode)
        const response = await axiosInstance.post(`${API_URL}/api/employee-requests/${id}/approve`, {
            employee_id,
            qrcode,
            department,
            position,
            basicSalary,
            hierarchy,
            leaveCredits: parseInt(leaveCredits, 10)
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

export const exportData = cacheWrapper(async (table) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/api/export/${table}`, {
            responseType: 'blob', // Set the response type to 'blob'
        });
        return response; // Return the blob data
    } catch (error) {
        throw error;
    }
});

export const forgatPassword = async (email) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/api/auth/reset-password`, { email: email })
        return res
    } catch (e) {
        throw e
    }
}

export const checkPayroll = async () => {
    try {
        const res = await axiosInstance.post(`${API_URL}/api/run-payroll`)
        return res
    } catch (e) {
        return e.message
    }
}


export const getUserDataDashboard = cacheWrapper(async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/api/user-dashboard`)
        return res
    } catch (e) {
        throw e
    }
})

export const getAdminData = cacheWrapper(async (email) => {
    try {
        const res = await axiosInstance.get(`${API_URL}/api/get-admin`, { params: { email } })
        return res
    } catch (e) {
        throw null
    }
})

export const checkLeaveRequest = async () => {
    try {
        const res = await axiosInstance.post(`${API_URL}/api/check-leave-requests`)
        return res
    } catch (e) {
        throw e
    }
}