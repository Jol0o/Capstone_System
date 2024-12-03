'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { CalendarIcon, ChevronLeft, ChevronRight, FileDown, MoreHorizontal, User } from "lucide-react";
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
import { useRouter } from 'next/navigation';
import generate from '../pdf_template/generatePDF';
import { exportData, getAllUserAttendances, getAttendance, removeAttendance, searchAttendance } from '@/lib/api';
import * as XLSX from 'xlsx';
import { format, parse, differenceInMinutes } from 'date-fns';
import Loader from '../Loader';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from '../ui/calendar';

function Attendance() {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const limit = 10
    const { token } = useAuth()
    const router = useRouter()
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [monthlyAttendance, setMonthlyAttendance] = useState([])
    const table = "attendance"

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 15);

    // Format the dates to 'YYYY-MM-DD'
    const formattedStartDate = format(defaultStartDate, 'yyyy-MM-dd');
    const formattedEndDate = format(new Date(), 'yyyy-MM-dd');

    const [startDate, setStartDate] = useState(formattedStartDate);
    const [endDate, setEndDate] = useState(formattedEndDate);

    const handleStartDateChange = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setStartDate(formattedDate);
        if (formattedDate && (!endDate || date > new Date(endDate))) {
            setEndDate(formattedDate);
        }
    };

    const handleEndDateChange = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        if (formattedDate && startDate && new Date(formattedDate) < new Date(startDate)) {
            setEndDate(startDate);
        } else {
            setEndDate(formattedDate);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (filter.trim() === '') {
                setFilteredData(data);
                return;
            }
            const res = await searchAttendance(filter.trim());
            setFilteredData(res.data.data);
        };

        fetchData();
    }, [filter]);

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    useEffect(() => {
        setIsLoading(true)
        const fetchpayroll = async () => {
            const response = await getAttendance(page, limit, startDate, endDate)
            if (response) {
                console.log(response.data)
                setTotalPages(response.data.totalPages)
                setData(response.data.data)
                setFilteredData(response.data.data)
                setIsLoading(false)
            }
        }

        fetchpayroll()
    }, [page, startDate, endDate])

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const fetchMonthlyAttendance = async () => {
        setIsLoading(true)
        try {
            const res = await getAllUserAttendances(startDate, endDate)
            if (res.status === 200) {
                exportToCSV(res.data.data)
                setIsLoading(false)
            }
        } catch (e) {
            toast.error("Error fetching monthly attendance")
            setIsLoading(false)
        }
    }

    const deleteAttendance = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this attendance?");

        if (!isConfirmed) {
            return;
        }
        try {
            await removeAttendance(id, token)
            toast("Successfull", {
                description: "Deleted payroll successfully!",
            })
            setData(data.filter(item => item.id !== id))
            setFilteredData(filterData.filter(item => item.id !== id))
        } catch (error) {
            console.error('Error deleting payroll:', error);
        }
    }

    const exportToCSV = (data) => {
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'attendance.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const calculateLateTime = (timeIn) => {
        const timeInDate = parse(timeIn, 'hh:mm a', new Date());
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0, 0);

        if (timeInDate > eightAM) {
            const minutesLate = differenceInMinutes(timeInDate, eightAM);
            const hoursLate = Math.floor(minutesLate / 60);
            const remainingMinutesLate = minutesLate % 60;
            return `${hoursLate > 0 ? `${hoursLate} hour(s) ` : ''}${remainingMinutesLate} minute(s) late`;
        }
        return 'On time';
    };

    const calculateEarlyLeaveOrOvertime = (timeOut) => {
        const timeOutDate = parse(timeOut, 'hh:mm a', new Date());
        const sevenPM = new Date();
        sevenPM.setHours(19, 0, 0, 0);

        if (timeOutDate < sevenPM) {
            const minutesEarly = differenceInMinutes(sevenPM, timeOutDate);
            const hoursEarly = Math.floor(minutesEarly / 60);
            const remainingMinutesEarly = minutesEarly % 60;
            return `${hoursEarly > 0 ? `${hoursEarly} hour(s) ` : ''}${remainingMinutesEarly} minute(s) early`;
        } else if (timeOutDate > sevenPM) {
            const minutesOvertime = differenceInMinutes(timeOutDate, sevenPM);
            const hoursOvertime = Math.floor(minutesOvertime / 60);
            return `Overtime: ${hoursOvertime > 0 ? `${hoursOvertime} hour(s)` : ''}`;
        }
        return '';
    };
    if (isLoading) return <Loader />

    return (
        <div className="w-full">
            <div className="flex flex-col items-center justify-between py-4 md:flex-row">
                <div className="flex gap-2">
                    <Input
                        placeholder="Filter Attendance..."
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {format(new Date(startDate), "MMM d")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={new Date(startDate)}
                                    onSelect={handleStartDateChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-gray-500">to</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {format(new Date(endDate), "MMM d")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={new Date(endDate)}
                                    onSelect={handleEndDateChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01") || (startDate && date < new Date(startDate))
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* <Button disabled={filterData.length === 0} onClick={() => exportToCSV(monthlyAttendance)} variant="outline" className="gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        Monthly Attendance
                    </Button> */}
                    <Button disabled={filterData.length === 0} onClick={fetchMonthlyAttendance} variant="outline" className="gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={() => router.push('scan')} className="flex items-center gap-2">Scan QR</Button>
                </div>

            </div>
            <div className="border rounded-md">
                {filterData && filterData.length ? <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="capitalize">Name</TableHead>
                            <TableHead className="capitalize">Date</TableHead>
                            <TableHead className="capitalize">Time In</TableHead>
                            <TableHead className="capitalize">Time Out</TableHead>
                            <TableHead className="capitalize">Total Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filterData.map(item =>
                                <TableRow key={item.id}>
                                    <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                        {item.avatar ? <Image src={item.avatar} alt={item.avatar} width={36}
                                            height={36}
                                            className="object-cover overflow-hidden rounded-full max-h-7" /> : <User />}
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{formatDate(item.date)}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.time_in} <span className="text-red-500">({calculateLateTime(item.time_in)})</span> </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.time_out} <span className="text-red-500">{calculateEarlyLeaveOrOvertime(item.time_out)}</span></TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.hours}</TableCell>
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
                                                onClick={() => navigator.clipboard.writeText(item.id)}
                                            >
                                                Copy Attendance ID
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => deleteAttendance(item.id)}
                                            >
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

                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    {totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>}
                </div>
            </div>}
        </div>
    )
}

export default Attendance