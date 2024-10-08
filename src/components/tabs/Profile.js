'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import axios from "axios"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from "next/image"
import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import QRCode from "qrcode.react"
import { useRouter } from "next/navigation"
import { useStore } from '@/hooks/useStore';
import { editEmployeeData, getEmployeebyEmail, logoutUser } from "@/lib/api"
import io from 'socket.io-client';

const socket = io('https://api.aap-h.com');

function Profile() {
    const qrCodeRef = useRef(null);
    const { user } = useAuth()
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
        salary: 0,
        salary_date: ''
    })
    const [originalData, setOriginalData] = useState(null)
    const [image, setImage] = useState(null)
    const [date, setDate] = useState(null)
    const [qrCode, setQrcode] = useState(null)
    const router = useRouter()
    const userEmail = useStore(state => state.userEmail)


    const fetchUser = useCallback(async () => {
        const emailToUse = user?.email && user.status === 'user' ? user.email : userEmail;
        try {
            if (emailToUse) {
                const response = await getEmployeebyEmail(emailToUse);
                if (response.data.data.length > 0) {
                    const userData = response.data.data[0];
                    setUserData(userData);
                    setOriginalData(userData);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, [user, userEmail]);

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
            setImage(URL.createObjectURL(e.target.files[0]))
        } else {
            setImage(null)
            setUserData({ ...userData, avatar: "" });
        }
    };

    useEffect(() => {
        console.log(userData);
    }, [userData])

    const handleSave = async (e) => {
        e.preventDefault();

        const updateUserDataWithImage = async (imageKey, imageFunction) => {
            let image = await imageFunction();
            if (image) {
                const url = await uploadFile(image);
                setUserData((prevUserData) => ({ ...prevUserData, [imageKey]: url }));
                return true;
            }
            return false;
        };

        if (userData.avatar) {
            const url = await uploadAvatar(userData.avatar);
            if (url) {
                setUserData({ ...userData, avatar: url });
            }
        }

        if (userData.name !== originalData.name) {
            const qrCodeUpdated = await updateUserDataWithImage('qrcode', downloadQRCode);
            if (!qrCodeUpdated) return;
        }

        for (let key of Object.keys(userData)) {
            if (!userData.avatar && key === 'avatar') continue
            if (key === 'day_off') continue;
            if (!userData[key]) {
                toast("Error", {
                    description: `${key} is required`,
                });
                return;
            }
        }


        try {
            await editEmployeeData(userData);
            toast("Successful", {
                description: "Successfully saved!",
            });
            setUserData(originalData);
            setQrcode(null);
            setImage(null);
            setDate(null);
        } catch (error) {
            console.error(error);
        }
    };

    const downloadQRCode = async () => {
        if (qrCodeRef.current) {
            const canvas = qrCodeRef.current.querySelector("canvas");
            if (canvas) {
                return new Promise((resolve, reject) => {
                    canvas.toBlob(async (blob) => {
                        let downloadLink = document.createElement("a");
                        downloadLink.href = URL.createObjectURL(blob);
                        downloadLink.download = `${userData.name}.png`;
                        document.body.appendChild(downloadLink);
                        try {
                            const image = await uploadFile(blob);
                            if (image) {
                                // setUserData({ ...userData, qrcode: image })
                                // setQrcode(image);
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
        if (!file) return;
        const storageRef = ref(storage, file.name ? `qrCode/${file.name}` : `qrCode/${userData.name}.png`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        return downloadURL;
    };

    const uploadAvatar = async (file) => {
        if (!file) return;
        const storageRef = ref(storage, `avatars/${file.name}`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        return downloadURL;
    };

    useEffect(() => {
        if (date) {
            const newDate = new Date(date.getTime());
            newDate.setDate(newDate.getDate() + 1);
            const dateOnly = newDate.toISOString().slice(0, 10);
            setUserData(prevState => ({
                ...prevState,
                salary_date: dateOnly,
            }))
        }
    }, [date])

    const handleDiscard = () => {
        setUserData(originalData)
        setImage(null)
        setDate(null)
    }

    const handleChange = (e) => {
        if (e.target.name === "name") {
            setUserData(prevUserData => ({
                ...prevUserData,
                qrcode: "",
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
            router.push("/")
        } catch (e) {
            console.log(e)
        }
    }


    return (
        <div className="grid items-start max-w-[1000px] m-auto flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="flex-1 text-xl font-semibold tracking-tight shrink-0 whitespace-nowrap sm:grow-0">
                    Profile
                </h1>

                <div className="flex gap-2">
                    <Button onClick={handleDiscard} className="rounded-lg" variant="outline" size="sm"> Discard </Button>
                    <Button onClick={handleSave} className="rounded-lg" size="sm"> Save </Button>
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
                            <div className="space-y-1">
                                <Label htmlFor="name">Username</Label>
                                <Input type="tet" required id="name" value={userData?.name} name="name" onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" required id="email" value={userData?.email} name="email" onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone_number">phone_number</Label>
                                <Input type="number" required id="phone_number" value={userData?.phone_number} name="phone_number" onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input type="password" placeholder="*******" required id="password" value={userData?.password} name="password" onChange={handleChange} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-md">Employment Details</CardTitle>
                            <CardDescription>User Employment Information here </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="position">Position / Job Title</Label>
                                <Input type="tet" required id="position" value={userData?.position} name="position" onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="department">Department</Label>
                                <Input type="tet" required id="department" value={userData?.department} name="department" onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="salary">Salary</Label>
                                <Input type="tet" required id="salary" value={userData?.salary} name="salary" onChange={handleChange} />
                            </div>
                            <div className="grid items-center grid-cols-1 gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                " justify-start text-left font-normal",
                                                !userData.salary_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {userData.salary_date ? format(userData.salary_date, "PPP") : <span>Pick a date</span>}
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
                                </Popover>
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
                    <Card className="rounded-xl">
                        <CardHeader >
                            <CardTitle className="text-md">QR Code</CardTitle>
                            <CardDescription>User QR Code Here!</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col w-full">
                            {userData?.name === originalData?.name && userData.qrcode ?
                                <a href={userData.qrcode} target="_blank" download>
                                    <Image
                                        src={userData.qrcode}
                                        width={300}
                                        height={250}
                                        alt="Avatar"
                                        className="self-center max-h-[230px] overflow-hidden object-cover rounded-lg"
                                    />
                                </a> :
                                <div className="w-full max-w-[500px]" ref={qrCodeRef}>
                                    <QRCode size={200} level="M" value={userData.name} />
                                </div>
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>
            {user?.status === 'user' && <Button variant="ghost" onClick={logout} className="text-xs font-medium text-red-400">Log out</Button>}
        </div>
    )
}

export default Profile