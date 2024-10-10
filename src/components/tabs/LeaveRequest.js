import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { format, isBefore, isEqual, startOfDay } from "date-fns"
import { Calendar as CalendarIcon, Divide, LoaderCircle } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import useAuth from '@/hooks/useAuth';
import { toast } from "sonner"
import { getEmployeebyEmail, getEmployeeById, leaveRequest, userRequests } from '@/lib/api';
import { Badge } from "@/components/ui/badge"
import SubmitDialog from '../modal/SubmitDialog';


function LeaveRequest() {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [isLoading, setIsloading] = useState(false)
    const [data, setData] = useState([])
    const [request, setRequest] = useState(false)

    useEffect(() => {
        const getRequests = async () => {
            try {
                const res = await userRequests()
                if (res) {
                    console.log(res.data.data)
                    setData(res.data.data)
                    if (res.data.data.length === 0) {
                        setRequest(true)
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }

        getRequests()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    useEffect(() => {
        if (!user) return
        const fetchUser = async () => {
            try {
                const res = await getEmployeeById(user.user_id);
                console.log(res)
                if (res) {
                    if (res.data.length > 0) {
                        setFormData({ ...formData, name: res.data[0].name, email: user?.email })
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        fetchUser()
    }, [user])

    const handleSubmit = async (e) => {
        try {
            setIsloading(true)
            for (let key of Object.keys(formData)) {
                if (!formData[key]) {
                    toast("Error", {
                        description: `${key} is required`,
                    });
                    return;
                }
            }

            const res = await leaveRequest(formData)
            if (res) {
                console.log(isLoading)
                setIsloading(false)
                setFormData({
                    name: '',
                    email: '',
                    leaveType: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
                })
            }
        } catch (e) {
            console.log(e)
            setIsloading(false)
        }
    };

    return (
        <div className="w-full min-h-screen">
            <div className="max-w-[1000px] m-auto flex flex-col gap-5">
                <div className="flex justify-end">
                    <Button
                        variant={data.some(request => request.status === 'Pending' || request.status === 'Process') ? 'secondary' : ''}
                        disabled={data.some(request => request.status === 'Pending' || request.status === 'Process') ? true : undefined}
                        onClick={() => setRequest(!request)}
                    >
                        Create Request
                    </Button>
                </div>
                {request && <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-md">Leave Request Form</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <form className="flex flex-col gap-2">
                            <div>
                                <Label htmlFor="name">Name:</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email:</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="leaveType">Leave Type:</Label>
                                <Select
                                    id="leaveType"
                                    name="leaveType"
                                    onValueChange={(e) => setFormData({ ...formData, leaveType: e })} defaultValue={formData.leaveType}
                                    required
                                >
                                    <SelectTrigger className="w-full md:w-1/2">
                                        <SelectValue placeholder={`${formData.leaveType ? formData.leaveType : 'Choose type of leave'}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">Sick Leave</SelectItem >
                                        <SelectItem value="vacation">Vacation Leave</SelectItem >
                                        <SelectItem value="personal">Personal Leave</SelectItem >
                                    </SelectContent>
                                </Select>

                            </div>
                            <div className="flex flex-col w-full gap-2 md:flex-row">
                                <div className="flex flex-col w-full gap-1 md:w-1/2">
                                    <Label htmlFor="startDate">Start Date:</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.startDate}
                                                onSelect={(date) => {
                                                    setFormData({ ...formData, startDate: date });
                                                    console.log(date);
                                                }}
                                                initialFocus
                                                disabled={(date) => isBefore(date, startOfDay(new Date())) ? true : false}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col w-full gap-1 md:w-1/2">
                                    <Label htmlFor="endDate">End Date:</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.endDate}
                                                onSelect={(date) => {
                                                    setFormData({ ...formData, endDate: date });
                                                    console.log(date);
                                                }}
                                                initialFocus
                                                disabled={(date) => formData.startDate && (isBefore(date, startOfDay(formData.startDate)) || isEqual(date, startOfDay(formData.startDate))) ? true : false}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason:</Label>
                                <Textarea
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <SubmitDialog isLoading={isLoading} onSubmit={handleSubmit} label={"Leave request"}/>
                        </form>
                    </CardContent>
                </Card>}
                {data && data.map(item => (
                    <Card className="rounded-xl" key={item.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between capitalize text-md">
                                Leave Type: {item.leave_type}
                                <Badge>{item.status}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p>{item.reason}</p>
                            <CardDescription className="flex justify-between">
                                <p>Start Date: {format(new Date(item.start_date), "PPP")}</p>
                                <p>End Date: {format(new Date(item.end_date), "PPP")}</p>
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default LeaveRequest;