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
import { getEmployeeById, submitRequest, userRequests, removeLeaveRequest } from '@/lib/api';
import { Badge } from "@/components/ui/badge"
import { LoaderCircle, MoreHorizontal, LinkIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import { format, parseISO } from 'date-fns';
import generate from '../pdf_template/generatePDF';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import uploadToCloudinary from '@/lib/cloudy';
import { ConfirmationModal } from '../modal/ConfirmationModal';


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
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        personToTakeover: '',
        requestedBy: '',
        supportingDocument: null,
        distributionCopy: { employeeCopy: false, file201: false },
        leaveType: '',
    });

    const [open, setOpen] = useState(false)
    const [availableCredits, setAvailableCredits] = useState(0)
    const [selectedData, setSelectedData] = useState(null)
    const [isLoading, setIsloading] = useState(false)
    const [loadGenerate, setLoadGenerate] = useState(false)
    const [data, setData] = useState([])
    const [request, setRequest] = useState(false)
    const [link, setLink] = useState('')
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);


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
        const { name, value, files } = e.target;
        let updatedFormData = {
            ...formData,
            [name]: files ? files[0] : value
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
                        console.log(res.data)
                        setAvailableCredits(res.data[0].leaveCredits)
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
        setIsConfirmationOpen(true);
    };

    const handleConfirmedSubmit = async (e) => {
        e.preventDefault();
        setIsloading(true);

        try {
            // Validate required fields (skip 'supportingDocument' since it's handled separately)
            for (let key of Object.keys(formData)) {
                if (!formData[key] && key !== 'supportingDocument') {
                    toast("Error", {
                        description: `${key} is required`,
                    });
                    setIsloading(false);
                    return;
                }
            }

            // Upload the supporting document to Cloudinary
            let supportingDocumentUrl = null;
            if (formData.supportingDocument) {
                supportingDocumentUrl = await uploadToCloudinary(formData.supportingDocument, setIsloading);
            }

            // Prepare the form data for submission
            const formDataToSend = {
                ...formData,
                supportingDocumentUrl, // Add the uploaded document URL if it exists
            };

            // Submit the request with the form data
            const res = await submitRequest(formDataToSend); // Pass the form data directly, no need to stringify
            if (res) {
                toast("Success", {
                    description: res.data.message,
                });

                // Reset form data after successful submission
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
                    supportingDocument: null,
                    distributionCopy: { employeeCopy: false, file201: false },
                    leaveType: '',
                });
            }
            setRequest(false);
        } catch (e) {
            console.log(e);
            toast("Error", {
                description: e?.response?.data.message || e?.response?.data?.errors[0]?.msg || e.message || 'An error occurred, please try again.',
            });
            setIsConfirmationOpen(false)
        } finally {
            setIsloading(false);
            
            setIsConfirmationOpen(false)
        }
    };

    const handleGenerate = async (data) => {
        setLoadGenerate(true)
        console.log(data)
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
            console.warn(e)
            setLoadGenerate(false)
        }
    }

    const InfoRow = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium text-gray-400">{label}</div>
            <div className="col-span-2 text-sm text-white">{value}</div>
        </div>
    )

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    const deletePayroll = async (item) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this request?");

        if (!isConfirmed) {
            return;
        }

        if (item.status !== 'Pending') return toast.error(`Can't delete the request with status of ${item.status}!`)

        try {
            const res = await removeLeaveRequest(item.id)
            toast("Successfull", {
                description: "Deleted request successfully!",
            })
            setData(data.filter(item => item.id !== id))
            setFilteredData(filterData.filter(item => item.id !== id))
            window.location.reload();
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    }

           const downloadPDF = (link) => {
            const anchor = document.createElement('a');
            anchor.href = link;
            anchor.download = 'form.pdf';
            anchor.target = '_blank'; // Open link in a new tab
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
    };
    
    console.log(availableCredits);


    return (
        <>
            <div className="w-full min-h-screen">
                <div className="max-w-[1000px] m-auto flex flex-col gap-5">
                    <div className="flex justify-end">
                        <Button
                            variant={data.some(request => request.status === 'Pending' || request.status === 'Process') ? 'secondary' : ''}
                            disabled={data.some(request => request.status === 'Pending' || request.status === 'Process' || request.status === 'Approved') ? true : undefined}
                            onClick={() => {
                                if (availableCredits >= 0) {
                                    setRequest(!request);
                                } else {
                                    toast.error("Not enough credits!")
                                }
                            }}
                        >
                            {/* Button content here */}
                            Leave Request Form
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
                                            <Input type="text" id="name" className="h-6 p-0 text-sm border-none" name='name' value={formData.name} onChange={handleChange} disabled />
                                        </div>
                                        <div className="flex-1 min-w-[50%] p-1 border-b border-gray-300">
                                            <Label htmlFor="dateFiled" className="text-xs font-bold">DATE FILED:</Label>
                                            <Input type="date" id="dateFiled" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} disabled />
                                        </div>
                                        <div className="flex-1 min-w-[50%] p-1 border-r border-gray-600">
                                            <Label htmlFor="position" className="text-xs font-bold">POSITION:</Label>
                                            <Input type="text" id="position" className="h-6 p-0 text-sm border-none" name='position' value={formData.position} onChange={handleChange} disabled />
                                        </div>
                                        <div className="flex-1 min-w-[50%] p-1">
                                            <Label htmlFor="department" className="text-xs font-bold">DEPARTMENT:</Label>
                                            <Input type="text" id="department" className="h-6 p-0 text-sm border-none" name='department' value={formData.department} onChange={handleChange} disabled />
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
                                            <Input type="number" id="daysRequested" className="h-6 p-0 text-sm border-none" name='daysRequested' value={formData.daysRequested} onChange={handleChange} required disabled />
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
                                            <Input type="text" id="requestedBy" className="h-6 p-0 text-sm border-none" name='requestedBy' value={formData.requestedBy} onChange={handleChange} disabled />
                                        </div>
                                        <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                            <Label htmlFor="approvedBy" className="text-xs font-bold">Approved by:</Label>
                                            <Input type="text" id="approvedBy" className="h-6 p-0 text-sm border-none" name='approvedBy' value={formData.approvedBy} onChange={handleChange} readOnly disabled />
                                        </div>
                                        <div className="flex-1 min-w-[33%] p-1">
                                            <Label htmlFor="receivedBy" className="text-xs font-bold">Received by:</Label>
                                            <Input type="text" id="receivedBy" className="h-6 p-0 text-sm border-none" name='receivedBy' value={formData.receivedBy} onChange={handleChange} readOnly disabled />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap border border-gray-300">
                                        <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
                                            <Label htmlFor="date" className="text-xs font-bold">Date:</Label>
                                            <Input type="date" id="date" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} readOnly disabled />
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
                                                        <Input type="text" className="w-16 h-6 p-0 text-center border border-gray-600" value={availableCredits} readOnly disabled />
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Less: Requested leave</span>
                                                        <Input type="text" className="w-16 h-6 p-0 text-center border border-gray-600" value={formData.daysRequested || ''} readOnly disabled />
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Balance</span>
                                                        <Input
                                                            type="text"
                                                            className="w-16 h-6 p-0 text-center border border-gray-600"
                                                            value={
                                                                formData.daysRequested && !isNaN(availableCredits) && !isNaN(formData.daysRequested)
                                                                    ? availableCredits - formData.daysRequested
                                                                    : ''
                                                            }
                                                            readOnly
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap border border-gray-300">
                                        <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                            <Label htmlFor="supportingDocument" className="text-xs font-bold">SUPPORTING DOCUMENT ATTACHMENT</Label>
                                            <Input
                                                type="file"
                                                id="supportingDocument"
                                                className="h-6 p-0 text-sm border-none"
                                                name="supportingDocument"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setFormData((prevFormData) => ({
                                                        ...prevFormData,
                                                        supportingDocument: file,
                                                    }));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[50%] p-1">
                                            <Label htmlFor="recordedBy" className="text-xs font-bold">Recorded by:</Label>
                                            <Input type="text" id="recordedBy" className="h-6 p-0 text-sm border-none" readOnly disabled />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap border border-gray-300">
                                        <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
                                            <Label htmlFor="date" className="text-xs font-bold">Date:</Label>
                                            <Input type="date" id="date" className="h-6 p-0 text-sm border-none" name='date' value={formData.date} onChange={handleChange} disabled />
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
                                        {item.status !== 'Pending' && item.status !== 'Process' ? (
                                            <Button
                                                size="sm"
                                                disabled={loadGenerate}
                                                variant="outline"
                                                onClick={() => handleGenerate(item)}
                                                className="flex items-center h-7"
                                            >
                                                {loadGenerate ? <LoaderCircle className="animate-spin" /> : 'Generate'}
                                            </Button>
                                        ) : null}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="w-8 h-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={
                                                    () => {
                                                        setOpen(true)
                                                        setSelectedData(item)
                                                    }
                                                }
                                                >
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deletePayroll(item)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex flex-wrap justify-between">
                                    <div>Reason: {item.reason}</div>
                                    <div>Start Date: {format(parseISO(item.inclusive_dates), "PPP")}</div>
                                    <div>End Date: {format(parseISO(item.to_date), "PPP")}</div>
                                </div>
                               
                                   {link && <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm ">
                                <LinkIcon size={16} />
                                <span>Form Link:</span>
                            </div>
                            <Input
                                value={link}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button onClick={() => downloadPDF(link)} className="bg-blue-600 hover:bg-blue-700">
                                Download
                            </Button>
                        </div>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl bg-black border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">Leave Request Details</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] pr-4">
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Employee Information</h3>
                                <InfoRow label="Name" value={selectedData?.name} />
                                <InfoRow label="Email" value={selectedData?.email} />
                                <InfoRow label="Employee ID" value={selectedData?.employee_id} />
                                <InfoRow label="Department" value={selectedData?.department} />
                                <InfoRow label="Position" value={selectedData?.position} />
                            </div>

                            <div className="p-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Leave Details</h3>
                                <InfoRow label="Leave Type" value={selectedData?.leave_type} />
                                <InfoRow label="Days Requested" value={selectedData?.days_requested} />
                                <InfoRow label="Inclusive Dates" value={`${formatDate(selectedData?.inclusive_dates)} - ${formatDate(selectedData?.to_date)}`} />
                                <InfoRow label="Reason" value={selectedData?.reason} />
                                <InfoRow label="Person to Takeover" value={selectedData?.person_to_takeover} />
                                <InfoRow label="With Pay" value={selectedData?.withpay === null ? 'Not specified' : selectedData?.withpay ? 'Yes' : 'No'} />
                            </div>

                            <div className="p-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Request Status</h3>
                                <InfoRow
                                    label="Status"
                                    value={
                                        <Badge
                                            variant={selectedData?.status === "Approved" ? "success" :
                                                selectedData?.status === "Pending" ? "warning" : "destructive"}
                                            className="capitalize"
                                        >
                                            {selectedData?.status}
                                        </Badge>
                                    }
                                />
                                <InfoRow label="Requested By" value={selectedData?.requested_by} />
                                <InfoRow label="Date Requested" value={formatDate(selectedData?.created_at)} />
                                {selectedData?.status !== "Done" || selectedData?.status !== 'Approved' && <> <InfoRow label="Approved By" value={selectedData?.approved_by} />
                                    <InfoRow
                                        label="Date of Approval"
                                        value={selectedData?.date_of_approve ? formatDate(selectedData.date_of_approve) : "N/A"}
                                    />
                                    <InfoRow label="Received By" value={selectedData?.received_by} />
                                    <InfoRow
                                        label="Date Received"
                                        value={selectedData?.date_of_received ? formatDate(selectedData.date_of_received) : "N/A"}
                                    />
                                    <InfoRow label="Recorded By" value={selectedData?.recorded_by} />
                                    <InfoRow label="Department Head" value={selectedData?.department_head} />
                                    <InfoRow label="HR Department" value={selectedData?.hr_department} /> </>}
                            </div>

                            <div className="p-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Additional Information</h3>
                                <InfoRow
                                    label="Supporting Document"
                                    value={
                                        selectedData?.supporting_document ? (
                                            <a href={selectedData?.supporting_document} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                View Document
                                            </a>
                                        ) : 'No document provided'
                                    }
                                />
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
                                    <div className="text-sm font-medium text-gray-400">Distribution Copy</div>
                                    <div className="col-span-2 space-y-1">
                                        {selectedData?.distribution_copy && (
                                            <>
                                                <div className="flex items-center gap-2 text-sm text-white">
                                                    <div className={`w-2 h-2 rounded-full ${JSON.parse(selectedData.distribution_copy).employeeCopy ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                    Employee Copy
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-white">
                                                    <div className={`w-2 h-2 rounded-full ${JSON.parse(selectedData.distribution_copy).file201 ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                    201 File
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirm={handleConfirmedSubmit}
                isLoading={isLoading}
                title="Confirm Leave Request Submission"
                description="Are you sure you want to submit this leave request? This action cannot be undone."
            />
        </>
    );
}

export default LeaveRequest;
