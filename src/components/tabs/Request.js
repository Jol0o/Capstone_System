'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileDown, MoreHorizontal, User, Eye, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { exportData, getLeaveRequests, removeLeaveRequest, searchPayroll, updateLeaveStatus, checkLeaveRequest } from '@/lib/api';
import UpdateLeaveStatus from '../modal/UpdateLeaveStatus';
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';
import Loader from '../Loader';
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from '../ui/label';
import { SunIcon } from '@radix-ui/react-icons';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

function Request() {
    const limit = 15
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [open, setOpen] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [status, setStatus] = useState('')
    const [checking, setChecking] = useState(false)
    const table = "leaveRequest"

    useEffect(() => {
        const fetchData = async () => {
            if (filter.trim() === '') {
                setFilteredData(data);
                return;
            }
            const res = await searchPayroll(filter.trim());
            setFilteredData(res.data.data);
        };

        fetchData();
    }, [filter]);

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const fetch = async () => {
        setIsLoading(true)
        try {
            const res = await getLeaveRequests(limit, page)
            if (res) {
                console.table('Request', res.data)
                setData(res.data.data)
                setFilteredData(res.data.data)
                setIsLoading(false)
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetch();
    }, []);

    useEffect(() => {
        // Listen for real-time updates
        const handleRequestDataUpdate = (update) => {
            console.log('Update received:', update);
            fetch();
        };

        socket.on('leaveRequestUpdate', handleRequestDataUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('leaveRequestUpdate', handleRequestDataUpdate);
        };
    }, [fetch]);

    const handleExcelDownload = async () => {
        try {
            const res = await exportData(table);
            console.log('Response:', res); // Log the response

            if (res.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${table}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error:', e); // Log the error
            toast.error("Error", {
                description: e.message,
            });
        }
    };

    const handleRemove = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this request?");

        if (!isConfirmed) {
            return;
        }

        try {
            const res = await removeLeaveRequest(id)
            if (res) {
                toast.success('Success removed leave request!');
                fetch()
            }
        } catch (e) {
            console.error('Error:', e); // Log the error
        }
    }

    const handleUpdate = async () => {
        if (status.trim() === "" || !selectedData.id) return;
    
        const trimmedData = {
            status: status.trim(),
            approved_by: selectedData.approved_by?.trim() || "",
            received_by: selectedData.received_by?.trim() || "",
            recorded_by: selectedData.recorded_by?.trim() || "",
            department_head: selectedData.department_head?.trim() || "",
            hr_department: selectedData.hr_department?.trim() || "",
            rejected_reason: selectedData.rejected_reason?.trim() || "",
            withpay: selectedData.withpay
        };
    
        // Define required fields based on status
        const requiredFields = {
            Approved: ["approved_by", "received_by", "recorded_by", "department_head", "hr_department"],
            Rejected: ["received_by", "recorded_by"]
        };
    
        // Check if any of the required fields are empty based on status
        const emptyFields = Object.entries(trimmedData)
            .filter(([key, value]) => requiredFields[status]?.includes(key) && value === "")
            .map(([key]) => key.replace('_', ' '));
    
        if (emptyFields.length > 0) {
            toast(`Please fill in all required fields: ${emptyFields.join(', ')}`);
            return;
        }
    
        try {
            const res = await updateLeaveStatus(selectedData.id, trimmedData);
            if (res.status === 200) {
                toast("Successfully updated the status");
                setOpen(false)
            }
        } catch (e) {
            console.log(e);
            toast.error("Error", {
                description: e?.response?.data.message || e.message,
            });
        }
    };

    const handleChange = (value) => {
        setStatus(value);
    };

    if (isLoading) return <Loader />

    const InfoRow = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
            <div className="text-sm font-semibold ">{label}</div>
            <div className="col-span-2 text-sm font-medium ">{value}</div>
        </div>
    )

    const requestFucntion = async () => {
        setChecking(true)
        try {
            const res = await checkLeaveRequest()
            if (res.status === 200) {
                toast.error("Success", {
                    description: res.data.message,
                });
                setChecking(false)
            }
        } catch (e) { 
            toast.error("Error", {
                description: e?.response?.data.message || e.message,
            });
            setChecking(false)
        }
    }

    return (
        <>
            <div className="w-full">
                <div className="flex flex-col items-center justify-between py-4 md:flex-row">
                    <Input
                        placeholder="Filter Leave Requests..."
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex items-center gap-1" >
                        <Button onClick={requestFucntion} disabled={checking} >
                            {checking ? <LoaderCircle className="animate-spin" /> : 'Check Leave Request'}
                        </Button>
                        <Button disabled={filterData.length === 0} onClick={() => handleExcelDownload(filterData)} variant="outline" className="gap-1">
                            <FileDown className="h-3.5 w-3.5" />
                            Export
                        </Button>
                    </div>
                   
                </div>
                <div className="border rounded-md">
                    {filterData && filterData.length ? <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold capitalize">Name</TableHead>
                                <TableHead className="font-bold capitalize">Created At</TableHead>
                                <TableHead className="font-bold capitalize">Type</TableHead>
                                <TableHead className="font-bold capitalize">Start Date</TableHead>
                                 <TableHead className="font-bold capitalize">End Date</TableHead>
                                <TableHead className="font-bold capitalize">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                filterData.map(item =>
                                    <TableRow key={item?.id}>
                                        <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                            {item?.name}
                                        </TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{formatDate(item?.created_at)}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item?.leave_type}</TableCell>
                                        <TableCell className="w-auto capitalize whitespace-nowrap">{formatDate(item?.inclusive_dates)}</TableCell>
                                        <TableCell className="w-auto capitalize whitespace-nowrap">{formatDate(item?.to_date)}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item?.status}</TableCell>
                                        <TableCell className="max-w-[30px]"> <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="w-8 h-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {/* <DropdownMenuItem
                                                    onClick={() => navigator.clipboard.writeText(item.employee_id)}
                                                >
                                                    Copy Employee ID
                                                </DropdownMenuItem> */}
                                                <DropdownMenuItem onClick={() => { setOpen(true); setSelectedData(item); setStatus(item.status) }}>
                                                    View
                                                </DropdownMenuItem>
                                                {/* <UpdateLeaveStatus data={item} /> */}
                                                <DropdownMenuItem onClick={() => handleRemove(item.id)}>
                                                    Delete
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu></TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table> : <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    colSpan={data.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>}
                </div>
                {data.length > 0 && <div className="flex items-center justify-end py-4 space-x-2">
                    {data.length > limit && <div className="flex items-center gap-2">
                        <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                        <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>}
                </div>}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Leave Request Details</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] pr-4">
                        <div className="space-y-4">
                            <div className="p-4 mb-4 rounded-lg ">
                                <h3 className="mb-2 text-lg font-semibold">Employee Information</h3>
                                <InfoRow label="Name" value={selectedData?.name} />
                                <InfoRow label="Email" value={selectedData?.email} />
                                <InfoRow label="Department" value={selectedData?.department} />
                                <InfoRow label="Position" value={selectedData?.position} />
                            </div>

                            <div className="p-4 mb-4 rounded-lg ">
                                <h3 className="mb-2 text-lg font-semibold">Leave Details</h3>
                                <InfoRow
                                    label="Leave Type"
                                    value={selectedData?.leave_type}
                                />
                                <InfoRow
                                    label="Days Requested"
                                    value={selectedData?.days_requested}
                                />
                                <InfoRow
                                    label="Reason"
                                    value={selectedData?.reason}
                                />
                                <InfoRow
                                    label="Person to Takeover"
                                    value={selectedData?.person_to_takeover}
                                />
                                <InfoRow
                                    label="Start Date"
                                    value={formatDate(selectedData?.inclusive_dates)}
                                />
                                <InfoRow
                                    label="End Date"
                                    value={formatDate(selectedData?.to_date)}
                                />
                            </div>

                            <div className="p-4 mb-4 rounded-lg ">
                                <h3 className="mb-2 text-lg font-semibold">Request Status</h3>
                                {(selectedData?.status !== 'Done' ) ? (
                                    <>
                                        <Select value={status} onValueChange={handleChange}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={status === "" ? data?.status : status} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Processing">Processing</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                            
                                        {/* Show additional inputs if status is "Approved" */}
                                        {status === "Approved" && (
                                            <div className="mt-4 space-y-4">
                                                <InfoRow label="Requested By" value={selectedData?.requested_by} />
                                                <InfoRow label="Date Requested" value={formatDate(selectedData?.created_at)} />
                                                <div>
                                                    <Label className="block text-sm">Approved By</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData?.approved_by || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, approved_by: e.target.value })}
                                                    />
                                                </div>
                                                <InfoRow
                                                    label="Date of Approval"
                                                    value={selectedData?.date_of_approve ? formatDate(selectedData.date_of_approve) : formatDate(new Date())}
                                                />
                                                <div>
                                                    <Label className="block text-sm">Received By</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData?.received_by || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, received_by: e.target.value })}
                                                    />
                                                </div>
                                                <InfoRow
                                                    label="Date Received"
                                                    value={selectedData?.date_of_received ? formatDate(selectedData.date_of_received) : formatDate(new Date())}
                                                />
                                                <div>
                                                    <Label className="block text-sm">Recorded By</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData?.recorded_by || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, recorded_by: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="block text-sm">Department Head</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData.department_head || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, department_head: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="block text-sm">HR Department</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData.hr_department || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, hr_department: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedData.withpay || false}
                                                        onChange={(e) => setSelectedData({ ...selectedData, withpay: e.target.checked })}
                                                    />
                                                    <label className="block text-sm">With Pay</label>
                                                </div>
                                            </div>
                                        )}
                            
                                        {/* Show additional inputs if status is "Rejected" */}
                                        {status === "Rejected" && (
                                            <div className="mt-4 space-y-4">
                                                 <InfoRow label="Requested By" value={selectedData?.requested_by} />
                                                <InfoRow label="Date Requested" value={formatDate(selectedData?.created_at)} />
                                                <div>
                                                    <Label className="block text-sm">Reason</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData.  rejected_reason || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, rejected_reason: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="block text-sm">Received By</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData.received_by || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, received_by: e.target.value })}
                                                    />
                                                </div>
                                                <InfoRow
                                                    label="Date Received"
                                                    value={selectedData?.date_of_received ? formatDate(selectedData.date_of_received) : formatDate(new Date())}
                                                />
                                                <div>
                                                    <Label className="block text-sm">Recorded By</Label>
                                                    <Input
                                                        type="text"
                                                        className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
                                                        value={selectedData.recorded_by || ""}
                                                        onChange={(e) => setSelectedData({ ...selectedData, recorded_by: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <InfoRow
                                        label="Status"
                                        value={
                                            <Badge
                                                variant={selectedData?.status === "Done" ? "success" :
                                                    selectedData?.status === "Pending" ? "warning" : "destructive"}
                                                className="capitalize"
                                            >
                                                {selectedData?.status}
                                            </Badge>
                                        }
                                    />
                                )}
                            
                                {status !== 'Approved' && status !== 'Rejected' ? (
                                    <>
                                        <InfoRow label="Requested By" value={selectedData?.requested_by} />
                                        <InfoRow label="Date Requested" value={formatDate(selectedData?.created_at)} />
                                        <InfoRow label="Approved By" value={selectedData?.approved_by} />
                                        <InfoRow
                                            label="Date of Approval"
                                            value={selectedData?.date_of_approve ? formatDate(selectedData.date_of_approve) : 'N/A'}
                                        />
                                        <InfoRow label="Received By" value={selectedData?.received_by} />
                                        <InfoRow
                                            label="Date Received"
                                            value={selectedData?.date_of_received ? formatDate(selectedData.date_of_received) : 'N/A'}
                                        />
                                        <InfoRow label="Recorded By" value={selectedData?.recorded_by} />
                                        <InfoRow label="Department Head" value={selectedData?.department_head} />
                                        <InfoRow label="HR Department" value={selectedData?.hr_department} />
                                    </>
                                ) : null}
                            </div>

                            <div className="p-4 mb-4 rounded-lg ">
                                <h3 className="mb-2 text-lg font-semibold">Additional Information</h3>
                                <InfoRow
                                    label="Supporting Document"
                                    value={
                                        selectedData?.supporting_document ? (
                                            <a href={selectedData?.supporting_document} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" download>
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
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-2 h-2 rounded-full ${JSON.parse(selectedData.distribution_copy).employeeCopy ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                    Employee Copy
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-2 h-2 rounded-full ${JSON.parse(selectedData.distribution_copy).file201 ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                    201 File
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleUpdate} className="w-full mt-3">
                                Submit
                            </Button>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Request