import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import useAuth from '@/hooks/useAuth';
import { toast } from "sonner"
import { getEmployeeById, submitRequest, userRequests } from '@/lib/api';
import { Badge } from "@/components/ui/badge"
import { LoaderCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { format, parseISO } from 'date-fns';
import generate from '../pdf_template/generatePDF';
import Link from 'next/link';
import Image from 'next/image';


const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

function LeaveRequest() {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        department: '',
        inclusiveDates: '',
        toDate: '',
        daysRequested: '',
        reason: '',
        date: '',
        personToTakeover: '',
        requestedBy: '',
        supportingDocument: '',
        distributionCopy: { employeeCopy: false, file201: false },
        leaveType: '',
    });

    const [isLoading, setIsloading] = useState(false)
    const [loadGenerate, setLoadGenerate] = useState(false)
    const [data, setData] = useState([])
    const [request, setRequest] = useState(false)
    const [link, setLink] = useState('')

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

    useEffect(() => {
        getRequests()
    }, [])

    useEffect(() => {
        // Listen for real-time updates
        socket.on('leaveRequestUpdate', (update) => {
            console.log('Update received:', update);
            getRequests()
        });

        // Cleanup on unmount
        return () => {
            socket.off('leaveRequestUpdate');
        };
    }, []);

    const calculateDaysRequested = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedFormData = {
            ...formData,
            [name]: value
        };

        if (name === 'inclusiveDates' || name === 'toDate') {
            const { inclusiveDates, toDate } = updatedFormData;
            if (inclusiveDates && toDate) {
                updatedFormData.daysRequested = calculateDaysRequested(inclusiveDates, toDate);
            }
        }

        setFormData(updatedFormData);
    };

    useEffect(() => {
        if (!user) return
        const fetchUser = async () => {
            try {
                const res = await getEmployeeById(user.user_id);
                if (res) {
                    if (res.data.length > 0) {
                        setFormData({ ...formData, name: res.data[0].name, email: user?.email, position: res.data[0].position, department: res.data[0].department, requestedBy: res.data[0].name })
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        fetchUser()
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsloading(true)
            for (let key of Object.keys(formData)) {
                if (!formData[key]) {
                    toast("Error", {
                        description: `${key} is required`,
                    });
                    setIsloading(false)
                    return;
                }
            }

            const res = await submitRequest(formData)
            if (res) {
                toast("Success", {
                    description: res.data.message,
                })
                setIsloading(false)
                setFormData({
                    name: '',
                    position: '',
                    department: '',
                    inclusiveDates: '',
                    toDate: '',
                    daysRequested: '',
                    reason: '',
                    date: '',
                    personToTakeover: '',
                    requestedBy: '',
                    supportingDocument: '',
                    distributionCopy: { employeeCopy: false, file201: false },
                    leaveType: '',
                })
                setRequest(false)
            }
            setIsloading(false)
        } catch (e) {
            console.log(e)
            toast("Error", {
                description: e?.response?.data.message || e.message || 'An error occured please try again.',
            })
            setIsloading(false)
        }
    };

    useEffect(() => {
        console.log(formData)
    }, [formData])

    const handleGenerate = async (data) => {
        setLoadGenerate(true)
        try {
            const link = await generate({ data });
            if (link) {
                window.open(link, '_blank');
                setLoadGenerate(false)
                toast("Success", {
                    description: `PDF Generated Successfully!`,
                })
                setLink(link)
            }
        } catch (e) {
            console.log(e)
            setLoadGenerate(false)
        }
    }

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
                        <div className="p-4 border border-gray-600">
                            <div className="p-2 mb-4 text-center bg-yellow-400">
                                <Image src="/NEW.jpg" alt="logo" width={1000} height={200} className="object-fit max-h-[200px]" />
                            </div>
                            <h2 className="py-2 mb-4 text-xl font-bold text-center text-white bg-black">APPLICATION FOR LEAVE FORM</h2>
                            <form className="space-y-2" onSubmit={handleSubmit}>
                                <div className="flex flex-wrap border border-gray-600">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-b border-gray-600">
                                        <Label htmlFor="name" className="text-xs font-bold">NAME:</Label>
                                        <Input type="text" id="name" className="h-6 p-0 text-sm border-none" name='name' value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1 border-b border-gray-300">
                                        <Label htmlFor="dateFiled" className="text-xs font-bold">DATE FILED:</Label>
                                        <Input type="date" id="dateFiled" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-600">
                                        <Label htmlFor="position" className="text-xs font-bold">POSITION:</Label>
                                        <Input type="text" id="position" className="h-6 p-0 text-sm border-none" name='position' value={formData.position} onChange={handleChange} required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label htmlFor="department" className="text-xs font-bold">DEPARTMENT:</Label>
                                        <Input type="text" id="department" className="h-6 p-0 text-sm border-none" name='department' value={formData.department} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="inclusiveDates" className="text-xs font-bold">INCLUSIVE DATES</Label>
                                        <Input
                                            type="date"
                                            id="inclusiveDates"
                                            className="h-6 p-0 text-sm border-none"
                                            name='inclusiveDates'
                                            value={formData.inclusiveDates}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="toDate" className="text-xs font-bold">TO:</Label>
                                        <Input type="date" id="toDate" className="h-6 p-0 text-sm border-none" name='toDate' value={formData.toDate} onChange={handleChange} required min={formData.inclusiveDates} />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label htmlFor="daysRequested" className="text-xs font-bold">No. of Days Requested:</Label>
                                        <Input type="number" id="daysRequested" className="h-6 p-0 text-sm border-none" name='daysRequested' value={formData.daysRequested} onChange={handleChange} required readOnly />
                                    </div>
                                </div>

                                <div className="p-1 border border-gray-600">
                                    <Label htmlFor="reason" className="text-xs font-bold">REASON:</Label>
                                    <Input type="text" id="reason" className="h-6 p-0 text-sm border-none" name='reason' value={formData.reason} onChange={handleChange} required />
                                </div>

                                <div className="p-1 border border-gray-300">
                                    <Label htmlFor="personToTakeover" className="text-xs font-bold">PERSON TO HAND OVER THE TASK:</Label>
                                    <Input type="text" id="personToTakeover" className="h-6 p-0 text-sm border-none" name='personToTakeover' value={formData.personToTakeover} onChange={handleChange} required />
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="requestedBy" className="text-xs font-bold">Requested by:</Label>
                                        <Input type="text" id="requestedBy" className="h-6 p-0 text-sm border-none" name='requestedBy' value={formData.requestedBy} onChange={handleChange} />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="approvedBy" className="text-xs font-bold">Approved by:</Label>
                                        <Input type="text" id="approvedBy" className="h-6 p-0 text-sm border-none" name='approvedBy' value={formData.approvedBy} onChange={handleChange} readOnly />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label htmlFor="receivedBy" className="text-xs font-bold">Received by:</Label>
                                        <Input type="text" id="receivedBy" className="h-6 p-0 text-sm border-none" name='receivedBy' value={formData.receivedBy} onChange={handleChange} readOnly />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                        <Label htmlFor="date" className="text-xs font-bold">Date:</Label>
                                        <Input type="date" id="date" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} />
                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1 border-r border-gray-600">
                                        <Label className="block mb-4 text-xs font-bold">DEPARTMENT HEAD</Label>
                                        <Label htmlFor="departmentHeadDate" className="text-xs font-bold">Date:</Label>

                                    </div>
                                    <div className="flex-1 min-w-[33%] p-1">
                                        <Label className="block mb-4 text-xs font-bold">HR DEPARTMENT</Label>
                                        <Label htmlFor="hrDepartmentDate" className="text-xs font-bold">Date:</Label>

                                    </div>
                                </div>

                                <div className="border border-gray-600">
                                    <div className="p-1 text-xs font-bold text-center text-white bg-black">FOR HRD&apos;S USE</div>
                                    <div className="flex flex-wrap p-2">
                                        <div className="flex-1 min-w-[50%]">
                                            <div className="mb-1 text-xs font-bold">TYPE OF LEAVE APPLIED FOR</div>
                                            {['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Solo Parent Act/Leave', 'Others:'].map((type) => (
                                                <div key={type} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id={type.replace(/\s+/g, '-').toLowerCase()}
                                                        name="leaveType"
                                                        value={type}
                                                        className="mr-1"
                                                        onChange={handleChange}
                                                    />
                                                    <Label htmlFor={type.replace(/\s+/g, '-').toLowerCase()} className="text-xs">{type}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-[50%]">
                                            <div className="flex items-center mb-1">
                                                <Checkbox id="with-pay" disabled className="mr-1" />
                                                <Label htmlFor="with-pay" className="text-xs">With Pay</Label>
                                            </div>
                                            <div className="flex items-center mb-1">
                                                <Checkbox id="without-pay" disabled className="mr-1" />
                                                <Label htmlFor="without-pay" className="text-xs">Without Pay</Label>
                                            </div>
                                            <div className="mt-2 mb-1 text-xs font-bold">DETAILS OF LEAVE MONITORING</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>Available leave credits</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-600" readOnly />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Less: Requested leave</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-600" readOnly />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Balance</span>
                                                    <Input type="text" className="w-16 h-6 p-0 border border-gray-600" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                        <Label htmlFor="supportingDocument" className="text-xs font-bold">SUPPORTING DOCUMENT ATTACHMENT</Label>
                                        <Input type="text" id="supportingDocument" placeholder="Please specify" className="h-6 p-0 text-sm border-none" name='supportingDocument' value={formData.supportingDocument} onChange={handleChange} required />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label htmlFor="recordedBy" className="text-xs font-bold">Recorded by:</Label>
                                        <Input type="text" id="recordedBy" className="h-6 p-0 text-sm border-none" readOnly />
                                    </div>
                                </div>

                                <div className="flex flex-wrap border border-gray-300">
                                    <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                        <Label htmlFor="date" className="text-xs font-bold">Date:</Label>
                                        <Input type="date" id="date" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} />
                                    </div>
                                    <div className="flex-1 min-w-[50%] p-1">
                                        <Label className="block mb-4 text-xs font-bold">HRD</Label>
                                        <Label htmlFor="hrDepartmentDate" className="text-xs font-bold">Date:</Label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-1 space-x-4 border border-gray-600">
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
                                <Button disabled={isLoading}>
                                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Submit'}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>}
                {data && data.map(item => (
                    <Card className="rounded-xl" key={item.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between capitalize text-md">
                                Leave Type: {item.leave_type}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge>{item.status}</Badge>
                                    {item.status === 'Pending' && <Button size="sm" disabled={loadGenerate} variant="outline" onClick={() => handleGenerate(item)} className="flex items-center h-7">{loadGenerate ? <LoaderCircle className="animate-spin" /> : 'Generate'}</Button>}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex flex-wrap justify-between">
                                <div>Reason: {item.reason}</div>
                                <div>Start Date: {format(parseISO(item.inclusive_dates), "PPP")}</div>
                                <div>End Date: {format(parseISO(item.to_date), "PPP")}</div>
                            </div>
                            {link && <div className="text-sm text-gray-500 max-w-[1000px] truncate whitespace-nowrap">
                                <Link href={link} target='_blank'>
                                    Form Link: {link}
                                </Link>
                            </div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default LeaveRequest;