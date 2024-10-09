'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import axios from 'axios';
import { toast } from 'sonner';
import createUser from '@/hooks/useCreateUser';
import { getEmployeeById } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
function UserForm({ id }) {
    const qrCodeRef = useRef(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        salary_date: null,
        department: '',
        position: '',
        qrcode: "",
        employee_id: "",
        phone_number: 0,
        salary: 0,
        day_off: 0
    });
    const [qrcode, setQrcode] = useState("")
    const [date, setDate] = useState(null);

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
    }, [])

    useEffect(() => {
        console.log(userForm)
        if (date) {
            const newDate = new Date(date.getTime());
            newDate.setDate(newDate.getDate() + 1);
            const dateOnly = newDate.toISOString().slice(0, 10);
            setUserForm(prevState => ({
                ...prevState,
                salary_date: dateOnly,
                employee_id: id ? prevState.employee_id : uuidv4()
            }))
        }
    }, [date])

    const handleChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Wait for the QR code to be downloaded
            const image = await downloadQRCode();
            if (image) {
                setUserForm({ ...userForm, qrcode: image });
            }
            // Now check the form fields
            for (let key of Object.keys(userForm)) {
                if (key === 'avatar' || key === 'day_off') continue;
                if (!userForm[key]) {
                    alert(`Please fill in the ${key} field.`);
                    return;
                }
            }
            // Proceed with the rest of the function
            const url = id ? `${API_URL}/api/employees/${id}` : `${API_URL}/api/create_employee`;
            const method = id ? 'put' : 'post';
            if (!id) await createUser({ email: userForm.email, password: userForm.phone_number.toString().slice(-4), id: userForm.employee_id });
            await axios[method](url, {
                name: userForm.name,
                email: userForm.email,
                salary_date: userForm.salary_date,
                department: userForm.department,
                position: userForm.position,
                qrcode: userForm.qrcode,
                phone_number: userForm.phone_number,
                password: userForm.phone_number.toString().slice(-4),
                salary: userForm.salary,
                employee_id: userForm.employee_id,
                day_off: userForm.day_off
            },)
                .then(() => {
                    toast("Successfull", {
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
                        employee_id: "",
                        salary: 0
                    });
                })
                .catch(error => {
                    toast("Error", {
                        description: error.response.data.errors[0].msg,
                    });
                });
        } catch (err) {
            console.error('Error:', err);
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
                        downloadLink.download = `${userForm.name}.png`;
                        document.body.appendChild(downloadLink);
                        try {
                            const image = await uploadFile(blob);
                            if (image) {
                                setUserForm({ ...userForm, qrcode: image })
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
        const storageRef = ref(storage, `qrCode/${userForm.name}.png`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        setQrcode(downloadURL);
        return downloadURL;
    };

    return (
        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
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
                    /></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                        id="salary"
                        type="number"
                        name="salary"
                        value={userForm.salary} onChange={handleChange}
                        placeholder="Enter salary"
                        required
                    /></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    " justify-start text-left font-normal",
                                    !userForm.salary_date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {userForm.salary_date ? format(userForm.salary_date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(date) => {
                                    setDate(date);
                                    console.log(date);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                        id="department"
                        type="text"
                        name="department"
                        value={userForm.department} onChange={handleChange}
                        placeholder="Enter department"
                        required
                    /></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                        id="position"
                        type="text"
                        name="position"
                        value={userForm.position} onChange={handleChange}
                        placeholder="Enter position"
                        required
                    /></div>
                <div className="grid items-center grid-cols-1 gap-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        type="number"
                        name="phone_number"
                        value={userForm.phone_number} onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                    />
                </div>
                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </div>
            {userForm.name && (
                <div className="hidden" ref={qrCodeRef}>
                    <QRCode size={200} level="M" value={userForm.name} />
                </div>
            )}
        </form>
    );
}

export default UserForm;