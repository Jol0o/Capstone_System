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
import { Checkbox } from '../ui/checkbox';


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
                        <div className="p-4 border border-gray-300">
                            <div className="p-2 mb-4 text-center bg-yellow-400">
                                <h1 className="text-2xl font-bold">GASBEE POS</h1>
                                <p className="text-sm">BEE GAS GANDA! • PRESYONG BODEGA!</p>
                            </div>
                            <h2 className="py-2 mb-4 text-xl font-bold text-center text-white bg-black">APPLICATION FOR LEAVE FORM</h2>
                            <form className="space-y-2">
                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-b border-gray-300">
                                        <Label htmlFor="name" className="text-xs font-bold">NAME:</Label>
                                        <Input type="text" id="name" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1 border-b border-gray-300">
                                        <Label htmlFor="date-filed" className="text-xs font-bold">DATE FILED:</Label>
                                        <Input type="date" id="date-filed" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                        <Label htmlFor="position" className="text-xs font-bold">POSITION:</Label>
                                        <Input type="text" id="position" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label htmlFor="department" className="text-xs font-bold">DEPARTMENT:</Label>
                                        <Input type="text" id="department" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="inclusive-dates" className="text-xs font-bold">INCLUSIVE DATES</Label>
                                        <Input type="text" id="inclusive-dates" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="to-date" className="text-xs font-bold">TO:</Label>
                                        <Input type="text" id="to-date" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label htmlFor="days-requested" className="text-xs font-bold">No. of Days Requested:</Label>
                                        <Input type="number" id="days-requested" className="h-6 p-0 text-sm border-none" required />
                                    </div>
                                </div>

                                <div className="p-1 border border-gray-300">
                                    <Label htmlFor="reason" className="text-xs font-bold">REASON:</Label>
                                    <Input type="text" id="reason" className="h-6 p-0 text-sm border-none" required />
                                </div>

                                <div className="p-1 border border-gray-300">
                                    <Label htmlFor="person-to-takeover" className="text-xs font-bold">PERSON TO HAND OVER THE TASK:</Label>
                                    <Input type="text" id="person-to-takeover" className="h-6 p-0 text-sm border-none" required />
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label className="text-xs font-bold">Requested by:</Label>
                                        <Input type="text" className="h-6 p-0 text-sm border-none" />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label className="text-xs font-bold">Approved by:</Label>
                                        <Input type="text" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label className="text-xs font-bold">Received by:</Label>
                                        <Input type="text" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label className="text-xs font-bold">Date:</Label>
                                        <Input type="date" className="h-6 p-0 text-sm border-none" />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label className="block mb-4 text-xs font-bold">DEPARTMENT HEAD</Label>
                                        <Label className="text-xs font-bold">Date:</Label>
                                        <Input type="date" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label className="block mb-4 text-xs font-bold">HR DEPARTMENT</Label>
                                        <Label className="text-xs font-bold">Date:</Label>
                                        <Input type="date" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                </div>

                                <div className="border border-gray-300">
                                    <div className="p-1 text-xs font-bold text-center text-white bg-black">FOR HRD&apos;S USE</div>
                                    <div className="flex flex-wrap p-2">
                                        <div className="flex-1 min-w-[50%]">
                                            <div className="mb-1 text-xs font-bold">TYPE OF LEAVE APPLIED FOR</div>
                                            {['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Solo Parent Act/Leave', 'Others:'].map((type) => (
                                                <div key={type} className="flex items-center">
                                                    <Checkbox id={type.replace(/\s+/g, '-').toLowerCase()} className="mr-1" />
                                                    <Label htmlFor={type.replace(/\s+/g, '-').toLowerCase()} className="text-xs">{type}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-[50%]">
                                            <div className="flex items-center mb-1">
                                                <Checkbox id="with-pay" className="mr-1" />
                                                <Label htmlFor="with-pay" className="text-xs">With Pay</Label>
                                            </div>
                                            <div className="flex items-center mb-1">
                                                <Checkbox id="without-pay" className="mr-1" />
                                                <Label htmlFor="without-pay" className="text-xs">Without Pay</Label>
                                            </div>
                                            <div className="mt-2 mb-1 text-xs font-bold">DETAILS OF LEAVE MONITORING</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Available leave credits</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-300" readOnly />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Less: Requested leave</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-300" readOnly />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Balance</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-300" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                        <Label htmlFor="supporting-document" className="text-xs font-bold">SUPPORTING DOCUMENT ATTACHMENT</Label>
                                        <Input type="text" id="supporting-document" placeholder="Please specify" className="h-6 p-0 text-sm border-none" />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label className="text-xs font-bold">Recorded by:</Label>
                                        <Input type="text" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                        <Label className="text-xs font-bold">Date:</Label>
                                        <Input type="date" className="h-6 p-0 text-sm border-none" />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label className="block mb-4 text-xs font-bold">HRD</Label>
                                        <Label className="text-xs font-bold">Date:</Label>
                                        <Input type="date" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-1 space-x-4 border border-gray-300">
                                    <span className="text-xs font-bold">DISTRIBUTION COPY</span>
                                    <div className="flex items-center">
                                        <Checkbox id="employee-copy" className="mr-1" />
                                        <Label htmlFor="employee-copy" className="text-xs">Employee</Label>
                                    </div>
                                    <div className="flex items-center">
                                        <Checkbox id="201-file" className="mr-1" />
                                        <Label htmlFor="201-file" className="text-xs">201 file</Label>
                                    </div>
                                </div>
                            </form>
                        </div>
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