'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, FileDown, MoreHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import Image from 'next/image';
import { getLeaveRequests, updateLeaveStatus } from '@/lib/api';
import UpdateLeaveStatus from '../modal/UpdateLeaveStatus';
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';
import Loader from '../Loader';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

function Request() {
    const limit = 15
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)

    useEffect(() => {
        setIsLoading(true)
        const fetchData = async () => {
            if (filter.trim() === '') {
                setFilteredData(data);
                return;
            }
            const res = await searchPayroll(filter.trim());
            setFilteredData(res.data.data);
            setIsLoading(false)
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

    const handleExcelDownload = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "leavereaquest.xlsx");
    };


    if (isLoading) return <Loader />

    return (
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
                            <TableHead className="capitalize">Id</TableHead>
                            <TableHead className="capitalize">Name</TableHead>
                            <TableHead className="capitalize">Created At</TableHead>
                            <TableHead className="capitalize">Start/End Date</TableHead>
                            <TableHead className="capitalize">Type</TableHead>
                            <TableHead className="capitalize">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filterData.map(item =>
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium max-w-[140px] whitespace-nowrap truncate overflow-hidden">{item.employee_id}</TableCell>
                                    <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                        {item.avatar ? <Image src={item.avatar} alt={item.avatar} width={30}
                                            height={36}
                                            className="object-cover overflow-hidden rounded-full max-h-7" /> : <User />}
                                        {item.name}s
                                    </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                                    <TableCell className="w-auto capitalize whitespace-nowrap">{formatDate(item.start_date)} / {formatDate(item.end_date)}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.leave_type}</TableCell>
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
                                            <UpdateLeaveStatus data={item} />
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
    )
}

export default Request