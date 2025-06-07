'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderCircle, FileDown, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStore } from '@/hooks/useStore';
import { editEmployeeData, getDeductionRates, getEmployeeById, getUserAttendance, logoutUser } from "@/lib/api";
import io from 'socket.io-client';
import HeatMap from '@uiw/react-heat-map';
import { Tooltip } from 'react-tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from 'xlsx';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';


const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

function Profile() {
    const qrCodeRef = useRef(null);
    const { user } = useAuth();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: '',
        day_off: false,
        department: '',
        position: '',
        phone_number: '',
        qrcode: '',
        basicSalary: 0,
        totalSalary: 0,
    });
    const [originalData, setOriginalData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [yearData, setYearData] = useState([])
    const [selectedYear, setSelectedYear] = useState('2024');
    const router = useRouter();
    const { removeAllUser, userEmail } = useStore();
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const [rawSalary, setRawSalary] = useState(0);
    const [showPass, setShowPass] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [eyePass, setEyePass] = useState(false)
    const [netPay, setNetPay] = useState(0);
    const [deductionRates, setDeductionRates] = useState(undefined); // Start as undefined
    const [isDeductionLoading, setIsDeductionLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            setIsDeductionLoading(true);
            const res = await getDeductionRates();
            if (res.success) {
                setDeductionRates({
                    sss: res.rates.sss_rate,
                    philhealth: res.rates.philhealth_rate,
                    pagibig: res.rates.pagibig_rate,
                });
            } else {
                setDeductionRates({ sss: 0.095, philhealth: 0.025, pagibig: 0.01 });
            }
            setIsDeductionLoading(false);
        };
        fetchRates();
    }, []);

    const filteredValue = yearData.filter(data =>
        isWithinInterval(new Date(data.date), { start: currentMonthStart, end: currentMonthEnd })
    );

    const fetchUser = useCallback(async () => {
        const id = userEmail ? userEmail : user?.user_id;
        console.log('Id', id)
        try {
            if (id) {
                const response = await getEmployeeById(id);
                if (response.data) {
                    const userData = response.data[0];
                    setUserData(userData);
                    setRawSalary(userData.basicSalary)
                    setOriginalData(userData);
                    console.log(userData)
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, [user]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        // Listen for real-time updates
        const handleEmployeeDataUpdate = (update) => {
            console.log('Update received:', update);
            fetchUser();
        };

        socket.on('employeeDataUpdate', handleEmployeeDataUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('employeeDataUpdate', handleEmployeeDataUpdate);
        };
    }, [fetchUser]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUserData({ ...userData, avatar: e.target.files[0] });
            setImage(URL.createObjectURL(e.target.files[0]));
        } else {
            setImage(null);
            setUserData({ ...userData, avatar: "" });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let data = { ...userData };

        if (userData.avatar && typeof userData.avatar !== 'string') {
            try {
                const url = await uploadAvatar(userData.avatar);
                if (url) {
                    data.avatar = url;

                    // Update avatar in local storage
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user) {
                        user.avatar = url;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            } catch (error) {
                console.error("Error uploading avatar:", error);
                toast("Error", {
                    description: "Failed to upload avatar. Please try again.",
                });
                setIsLoading(false);
                return;
            }
        }

        for (let key of Object.keys(data)) {
            if (!data.avatar && key === 'avatar') continue;
            if (key === 'day_off' || key === 'totalSalary' || key === 'monthSalary' || key === 'leaveCredits' || key === "lateDeduction" || key === "undertimeDeduction") continue;
            if (!data[key]) {
                toast("Error", {
                    description: `${key} is required`,
                });
                setIsLoading(false);
                return;
            }
        }

        if (showPass && data.password !== confirmPassword) {
            toast("Error", {
                description: "Password does not match",
            });
            setIsLoading(false);
            setShowPass(false);
            return;
        }

        try {
            await editEmployeeData(data);
            toast("Successful", {
                description: "Successfully saved!",
            });
            setOriginalData(data);
            setUserData(data);
            setImage(null);
            setShowPass(false);
            setEyePass(false);
        } catch (error) {
            console.error(error);
            toast("Error", {
                description: error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Failed to save data. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const uploadAvatar = async (file) => {
        if (!file) return;
        const storageRef = ref(storage, `avatars/${file.name}`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        return downloadURL;
    };

    const handleDiscard = () => {
        setUserData(originalData);
        setImage(null);
    };

    const handleChange = (e) => {
        console.log(userData)
        if (e.target.name === "name") {
            setUserData(prevUserData => ({
                ...prevUserData,
                [e.target.name]: e.target.value
            }));
        } else {
            setUserData({
                ...userData,
                [e.target.name]: e.target.value
            });
        }
    };

    async function logout() {
        try {
            await logoutUser();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('admin');
            localStorage.removeItem("tab");
            localStorage.removeItem("userEmail");
            removeAllUser()
            router.push("/");
        } catch (e) {
            console.log(e);
        }
    }

    // useEffect(() => {
    //     const id = userData?.employee_id;
    //     if (!id) return;
    //     const fetchAttendance = async () => {
    //         try {
    //             const res = await getUserAttendance(id);
    //             if (res.status === 200) {
    //                 setYearData(res.data.data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching attendance:', error);
    //         }
    //     };

    //     fetchAttendance();
    // }, [userData]);

    // const value = yearData.map((item) => {
    //     return ({
    //         date: item.date,
    //         status: item.status
    //     });
    // });

    // const getStatusColor = (status) => {
    //     switch (status) {
    //         case 'present': return '#4caf50'; // Green
    //         case 'late': return '#ffeb3b'; // Yellow
    //         case 'absent': return '#f44336'; // Red
    //         case 'off duty': return '#ff9800'; // Orange
    //         case 'no-data': return '#9e9e9e'; // Gray
    //         default: return '#9e9e9e'; // Gray
    //     }
    // };

    // const formatDate = (dateString) => {
    //     const options = { year: 'numeric', month: 'long', day: 'numeric' }
    //     return new Date(dateString).toLocaleDateString(undefined, options)
    // }

    const handleSalaryChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
        setRawSalary(value);
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            handleChange({ target: { name: 'basicSalary', value: numericValue } });
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    useEffect(() => {
        const sssDeduction = userData.totalSalary * (deductionRates?.sss ?? 0);
        const philHealthDeduction = userData.totalSalary * (deductionRates?.philhealth ?? 0);
        const pagIbigDeduction = userData.totalSalary * (deductionRates?.pagibig ?? 0);
        const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + userData.lateDeduction + userData.undertimeDeduction;
        const calculatedNetPay = userData.totalSalary - totalDeductions;
        setNetPay(calculatedNetPay);
    }, [userData, deductionRates]);


    return (
        <>
            <div className="grid items-start max-w-[1000px] m-auto flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="flex-1 text-xl font-semibold tracking-tight shrink-0 whitespace-nowrap sm:grow-0">
                        Profile
                    </h1>

                    <div className="flex gap-2">
                        {/* <Button onClick={handleDiscard} className="rounded-lg" variant="outline" size="sm"> Discard </Button> */}
                        {user?.status === 'user' && <Button onClick={() => setShowPass(!showPass)} className="rounded-lg" variant="outline" size="sm"> Change Password </Button>}
                        <Button onClick={handleSave} className="rounded-lg" size="sm">     {isLoading ? <LoaderCircle className="animate-spin" /> : 'Save'} </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-7">
                    <div className="flex flex-col gap-7 md:col-span-2">
                        <Card className="rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-md">User Details</CardTitle>
                                <CardDescription> User credentials here.  </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {/* <div className="space-y-1">
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input type="tet" required id="employee_id" value={userData?.employee_id} name="employee_id" readOnly disabled />
                                </div> */}
                                <div className="space-y-1">
                                    <Label htmlFor="name">Username</Label>
                                    <Input type="tet" required id="name" value={userData?.name} name="name" onChange={handleChange} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input type="email" required id="email" value={userData?.email} name="email" onChange={handleChange} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input type="number" required id="phone_number" value={userData?.phone_number} name="phone_number" onChange={handleChange} />
                                </div>
                                {showPass && <> <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input type={eyePass ? 'text' : 'password'} placeholder="*******" required id="password" value={userData?.password} name="password" onChange={handleChange} />
                                        <Button
                                            type="button"
                                            onClick={() => setEyePass(!eyePass)}
                                            className="absolute inset-y-0 right-0 flex items-center px-2"
                                        >
                                            {eyePass ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="change">Confirm Password</Label>
                                        <div className="relative">
                                            <Input type={eyePass ? 'text' : 'password'} placeholder="*******" required id="change" value={confirmPassword} name="change" onChange={(e) => setConfirmPassword(e.target.value)} />
                                            <Button
                                                type="button"
                                                onClick={() => setEyePass(!eyePass)}
                                                className="absolute inset-y-0 right-0 flex items-center px-2"
                                            >
                                                {eyePass ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div> </>}
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-md">Employment Details</CardTitle>
                                <CardDescription>User Employment Information here</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {user?.status === 'user' ? <div className="space-y-1">
                                    <Label htmlFor="day_off">Status</Label>
                                    <Input
                                        type="text"
                                        id="day_off"
                                        value={userData?.day_off ? 'Off Duty' : 'On Duty'}
                                        name="day_off"
                                        onChange={handleChange}
                                        disabled={user?.status === 'user' ? true : false}
                                    />
                                </div>
                                    : <div className="flex items-center gap-2">
                                        <Input
                                            type="checkbox"
                                            id="day_off"
                                            checked={userData?.day_off}
                                            name="day_off"
                                            className="w-5 h-5"
                                            onChange={(e) => setUserData({ ...userData, day_off: e.target.checked })}
                                            disabled={user?.status === 'user'}
                                        />
                                        <Label htmlFor="day_off">Day Off</Label>
                                    </div>}
                                <div className="space-y-1">
                                    <Label htmlFor="position">Position / Job Title</Label>
                                    <Input
                                        type="text"
                                        id="position"
                                        value={userData?.position}
                                        name="position"
                                        onChange={handleChange}
                                        disabled={user?.status === 'user' ? true : false}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        type="text"
                                        id="department"
                                        value={userData?.department}
                                        name="department"
                                        onChange={handleChange}
                                        disabled={user?.status === 'user' ? true : false}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="salary">Gross Pay</Label>
                                    <Input
                                        type="text"
                                        id="salary"
                                        value={rawSalary ? formatCurrency(rawSalary) : ''}
                                        name="basicSalary"
                                        onChange={handleSalaryChange}
                                        disabled={user?.status === 'user' ? true : false}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="totalsalary">Net Pay</Label>
                                    <Input
                                        type="text"
                                        id="totalsalary"
                                        value={formatCurrency(netPay || 0)}
                                        name="basicSalary"
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="hierarchy">Hierarchy</Label>
                                    <Select className="w-full" defaultValue={userData.hierarchy} disabled={user?.status === 'user' ? true : false} onValueChange={(value) => setUserData({ ...userData, hierarchy: value })}>
                                        <SelectTrigger className="bg-transparent border-gray-800 ">
                                            <SelectValue placeholder={userData && userData.hierarchy ? userData.hierarchy : "Select hierarchy"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Managerial", "Supervisor", "Rank & File"].map((hierarchy) => (
                                                <SelectItem key={hierarchy} value={hierarchy}>{hierarchy}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid items-center grid-cols-1 gap-2">
                                    <Label htmlFor="leaveCredits">Leave Credits</Label>
                                    <Input
                                        type="text"
                                        id="leaveCredits"
                                        value={userData?.leaveCredits}
                                        name="leaveCredits"
                                        onChange={handleChange}
                                        disabled={user?.status === 'user' ? true : false}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex flex-col gap-7">
                        <Card className="rounded-xl">
                            <CardHeader >
                                <CardTitle className="text-md">User Profile Picture</CardTitle>
                                <CardDescription>User Profile Picture Here!</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full">
                                {userData.avatar || image ?
                                    <>
                                        <Label htmlFor="avatar">
                                            <Image
                                                src={image ? image : userData.avatar}
                                                width={300}
                                                height={500}
                                                alt="Avatar"
                                                className="self-center max-h-[320px] overflow-hidden object-cover rounded-lg"
                                            />
                                            <div className="flex items-center justify-center w-full p-3 mt-2 border rounded-md hover:bg-muted"> Change Profile </div>
                                        </Label>
                                    </> :
                                    <Label htmlFor="avatar">
                                        <div className=" flex items-center justify-center h-[230px] w-full max-w-[500px] rounded-md border border-dashed">
                                            <p className="text-xs font-normal text-gray-400 capitalize">Click here to upload image!</p>
                                        </div>
                                    </Label>
                                }
                                <Input className="hidden" id="avatar" type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} />
                            </CardContent>
                        </Card>
                        <Card className="bg-white rounded-xl">
                            <CardHeader >
                                <CardTitle className="text-gray-700 text-md">QR Code</CardTitle>
                                <CardDescription className="text-gray-700">User QR Code Here!</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col w-full">
                                {userData?.qrcode &&
                                    <a href={userData.qrcode} target="_blank" download>
                                        <Image
                                            src={userData.qrcode}
                                            width={500}
                                            height={500}
                                            alt="Avatar"
                                            className="self-center max-h-[230px] overflow-hidden object-fit rounded-lg"
                                        />
                                    </a>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* <div className="max-w-[1000px] m-auto p-5">
                <Card className="p-3 border-gray-800">
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="text-white">Employee Attendance</CardTitle>
                                <CardDescription className="text-gray-400">Attendance overview</CardDescription>
                            </div>
                            <div>
                                <Button disabled={yearData.length === 0 ? true : false} onClick={() => handleExcelDownload(yearData)} variant="outline" size="sm" className="gap-1 h-7">
                                    <FileDown className="h-3.5 w-3.5" />
                                    Export
                                </Button>
                                <Select defaultValue={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[180px] bg-transparent border-gray-800 text-white">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                </Card></div> */}
        </>
    );
}

export default Profile;