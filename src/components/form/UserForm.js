'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import QRCode from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { toast } from 'sonner';
import createUser from '@/hooks/useCreateUser';
import { approveEmployeeRequest, getDepartments, getEmployeeById, getPositions } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useAuth from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
function UserForm({ id, setIsDialogOpen, data }) {
    const { user } = useAuth()
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    const fetchDepartments = async () => {
        const res = await getDepartments()
        if (res.success) setDepartments(res.departments)
    }

    const fetchPositions = async () => {
        const res = await getPositions()
        console.log(res)
        if (res.success) setPositions(res.positions)
    }

    useEffect(() => {
        fetchPositions()
        fetchDepartments()
    }, [])

    const qrCodeRef = useRef(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        department: '',
        position: '',
        employee_id: "",
        phone_number: '',
        basicSalary: 0,
        password: '',
        hierarchy: 'Rank & File',
        qrcode: "",
    });
    const [qrcode, setQrcode] = useState("")
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!id) return

        const fetchData = async () => {
            try {
                const response = await getEmployeeById(id);
                setUserForm({ ...userForm, ...response.data.data[0] });
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData()
    }, [id])

    useEffect(() => {
        if (data) {
            setUserForm({ ...userForm, ...data, employee_id: uuidv4() })
        }
    }, [data])

    console.log(userForm)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'number' && value < 0) {
            return; // Prevent negative values for number inputs
        }
        setUserForm({
            ...userForm,
            [name]: type === 'checkbox' ? checked : value.trim() === '' ? value.trim() : value
        });
    };

    const axiosInstance = axios.create({
        withCredentials: true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Wait for the QR code to be downloaded and uploaded
            const image = await downloadQRCode();
            if (!image && !userForm.qrcode) {
                throw new Error("QR code generation failed");
            }

            // Update the userForm with the QR code image only if the image is generated
            const updatedForm = image ? { ...userForm, qrcode: image } : { ...userForm };

            // Now check the form fields
            for (let key of Object.keys(updatedForm)) {
                if (key === 'avatar' || key === 'day_off') continue;
                if (!updatedForm[key]) {
                    toast("Error", {
                        description: `Please fill in the ${key} field.`,
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // Proceed with creating the employee first
            const url = id ? `${API_URL}/api/employees/${id}` : `${API_URL}/api/create_employee`;
            const method = id ? 'put' : 'post';
            await axiosInstance[method](url, {
                name: updatedForm.name,
                email: updatedForm.email,
                salary_date: updatedForm.salary_date,
                department: updatedForm.department,
                position: updatedForm.position,
                qrcode: updatedForm.qrcode,
                phone_number: updatedForm.phone_number,
                password: updatedForm.password || updatedForm.phone_number.toString().slice(-4),
                basicSalary: updatedForm.basicSalary,
                employee_id: updatedForm.employee_id,
                hierarchy: updatedForm.hierarchy,
                leaveCredits: parseInt(updatedForm.leaveCredits, 10),
            });

            // Now create the user only if the employee creation is successful
            if (!id) {
                await createUser({ email: updatedForm.email, password: updatedForm.password || updatedForm.phone_number.toString().slice(-4), id: updatedForm.employee_id });
            }

            toast("Successful", {
                description: "Employee added successfully!",
            });
            setUserForm({
                name: '',
                email: '',
                password: '',
                salary_date: '',
                department: '',
                position: '',
                qrcode: '',
                phone_number: '',
                basicSalary: 0,
                hierarchy: 'employee',
                employee_id: '',
                leaveCredits: 0
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error:', error.response?.data?.errors?.[0]?.msg);
            toast("Error", {
                description: error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Failed to save data. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproved = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log('running');
        try {
            const image = await downloadQRCode();
            if (!image && !userForm.qrcode) {
                throw new Error("QR code generation failed");
            }

            // Update the userForm with the QR code image only if the image is generated
            const updatedForm = image ? { ...userForm, qrcode: image } : { ...userForm };

            for (let key of Object.keys(updatedForm)) {
                if (!updatedForm[key]) {
                    toast("Error", {
                        description: `Please fill in the ${key} field.`,
                    });
                    setIsLoading(false);
                    return;
                }
            }

            const response = await approveEmployeeRequest(
                data.id,
                userForm.employee_id,
                userForm.department,
                userForm.position,
                userForm.basicSalary,
                updatedForm.qrcode,
                userForm.hierarchy,
                userForm.leaveCredits,
                user.name
            );
            toast("Successful", {
                description: "Employee request approved successfully!",
            });
            console.log('Approval successful:', response);
            setIsDialogOpen(false);
            setUserForm({
                name: '',
                email: '',
                password: '',
                salary_date: '',
                department: '',
                position: '',
                qrcode: '',
                phone_number: '',
                basicSalary: 0,
                hierarchy: 'employee',
                employee_id: ''
            });
            setQrcode("");
        } catch (error) {
            console.error('Approval failed:', error);
            toast("Error", {
                description: error.response?.data?.errors?.[0]?.msg || error?.message || "Failed to approve employee request. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const downloadQRCode = async () => {
        if (qrcode) return;
        if (qrCodeRef.current) {
            const canvas = qrCodeRef.current.querySelector("canvas");
            if (canvas) {
                return new Promise((resolve, reject) => {
                    canvas.toBlob(async (blob) => {
                        let downloadLink = document.createElement("a");
                        downloadLink.href = URL.createObjectURL(blob);
                        downloadLink.download = `${userForm.employee_id}.png`; // Use employee_id instead of name
                        document.body.appendChild(downloadLink);
                        try {
                            const image = await uploadFile(blob);
                            if (image) {
                                setUserForm({ ...userForm, qrcode: image });
                                setQrcode(image);
                                console.log(image);
                                document.body.removeChild(downloadLink);
                                resolve(image);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }, 'image/png');
                });
            }
        }
    };


    const uploadFile = async (file) => {
        const storageRef = ref(storage, `qrCode/${userForm.employee_id}.png`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        setQrcode(downloadURL);
        return downloadURL;
    };

    return (
        <form className='flex flex-col gap-3' onSubmit={data ? handleApproved : handleSubmit}>
            <div className="grid gap-4">
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        value={userForm.name} onChange={handleChange}
                        placeholder="Enter name"
                        required
                        readOnly disabled
                    /></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="text"
                        name="email"
                        value={userForm.email} onChange={handleChange}
                        placeholder="Enter email"
                        required
                        readOnly disabled
                    /></div>
                {/* <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="text"
                        name="password"
                        value={userForm.password}
                        placeholder="*****"
                        readOnly disabled
                    /></div> */}
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="basicSalary">Base Salary</Label>
                    <Input
                        id="basicSalary"
                        type="number"
                        name="basicSalary"
                        value={userForm.basicSalary}
                        onChange={handleChange}
                        placeholder="Enter base salary"
                        required
                    />
                </div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="leaveCredits">Leave Credits</Label>
                    <Input
                        id="leaveCredits"
                        type="number"
                        name="leaveCredits"
                        value={userForm.leaveCredits}
                        onChange={handleChange}
                        placeholder="Enter leave credits"
                        required
                    />
                </div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                        value={userForm.department}
                        onValueChange={(value) => setUserForm({ ...userForm, department: value })}
                        required
                    >
                        <SelectTrigger className="w-full bg-transparent border-gray-800">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                        value={userForm.position}
                        onValueChange={(value) => setUserForm({ ...userForm, position: value })}
                        required
                    >
                        <SelectTrigger className="w-full bg-transparent border-gray-800">
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                            {positions.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        type="text"
                        name="phone_number"
                        value={userForm.phone_number} onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                        disabled
                    />
                </div>
                <Select className="w-full" defaultValue={userForm.hierarchy} onValueChange={(value) => setUserForm({ ...userForm, hierarchy: value })}>
                    <SelectTrigger className="w-[180px] bg-transparent border-gray-800">
                        <SelectValue placeholder="Select hierarchy" />
                    </SelectTrigger>
                    <SelectContent>
                        {["Managerial", "Supervisor", "Rank & File"].map((hierarchy) => (
                            <SelectItem key={hierarchy} value={hierarchy}>{hierarchy}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" className="w-full">
                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Submit'}
                </Button>
            </div>
            {
                userForm.employee_id && (
                    <div className="hidden" ref={qrCodeRef}>
                        <QRCode size={200} level="M" value={userForm.employee_id} />
                    </div>
                )
            }
        </form >
    );
}

export default UserForm;