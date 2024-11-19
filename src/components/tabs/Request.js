'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileDown, MoreHorizontal, User, Eye } from "lucide-react";
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
import { exportData, getLeaveRequests, removeLeaveRequest, searchPayroll, updateLeaveStatus } from '@/lib/api';
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
        if (status === "" && !selectedData.id) return
        try {
            const res = await updateLeaveStatus(selectedData.id, status)
            if (res.status === 200) {
                toast(`Successfully updated the status`);
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleChange = (value) => {
        setStatus(value);
    };

    if (isLoading) return <Loader />

    const InfoRow = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium text-gray-400">{label}</div>
            <div className="col-span-2 text-sm text-white">{value}</div>
        </div>
    )

    return (
        <>
            <div className="w-full">
                <div className="flex items-center justify-between py-4">
                    <Input
                        placeholder="Filter Leave Requests..."
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <Button disabled={filterData.length === 0} onClick={() => handleExcelDownload(filterData)} variant="outline" className="gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        Export
                    </Button>
                </div>
                <div className="border rounded-md">
                    {filterData && filterData.length ? <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="capitalize">Name</TableHead>
                                <TableHead className="capitalize">Created At</TableHead>
                                <TableHead className="capitalize">Type</TableHead>
                                <TableHead className="capitalize">Start/End Date</TableHead>
                                <TableHead className="capitalize">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                filterData.map(item =>
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                            {item.avatar ? <Image src={item.avatar} alt={item.avatar} width={30}
                                                height={36}
                                                className="object-cover overflow-hidden rounded-full max-h-7" /> : <User />}
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item.leave_type}</TableCell>
                                        <TableCell className="w-auto capitalize whitespace-nowrap">{formatDate(item.inclusive_dates)} / {formatDate(item.to_date)}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item.status}</TableCell>
                                        <TableCell className="max-w-[30px]"> <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="w-8 h-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => navigator.clipboard.writeText(item.employee_id)}
                                                >
                                                    Copy Employee ID
                                                </DropdownMenuItem>
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
                    <div className="flex-1 text-sm text-muted-foreground">
                        {filterData.length} of{" "}
                        {data.length} row(s) selected.
                    </div>
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
                <DialogContent className="max-w-2xl bg-black border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">Leave Request Details</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] pr-4">
                        <div className="space-y-0">
                            <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Employee Information</h3>
                                <InfoRow label="Name" value={selectedData?.name} />
                                <InfoRow label="Email" value={selectedData?.email} />
                                <InfoRow label="Employee ID" value={selectedData?.employee_id} />
                                <InfoRow label="Department" value={selectedData?.department} />
                                <InfoRow label="Position" value={selectedData?.position} />
                            </div>

                            <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Leave Details</h3>
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
                            </div>

                            <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Request Status</h3>
                                <Select value={status} onValueChange={handleChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={status === "" ? data?.status : status} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Process">Process</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InfoRow
                                    label="Requested By"
                                    value={selectedData?.requested_by}
                                />
                                <InfoRow
                                    label="Date Requested"
                                    value={formatDate(selectedData?.created_at)}
                                />
                            </div>

                            <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Additional Information</h3>
                                <InfoRow
                                    label="Supporting Document"
                                    value={selectedData?.supporting_document}
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