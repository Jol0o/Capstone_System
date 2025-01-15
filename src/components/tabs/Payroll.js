'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, FileDown, LoaderCircle, MoreHorizontal, User, CalendarIcon, ChevronDownIcon } from "lucide-react";
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
import { checkPayroll, exportPayroll, getPayrolls, removePayroll, searchPayroll } from '@/lib/api';
import * as XLSX from 'xlsx';
import Loader from '../Loader';
import { format, parse, differenceInMinutes } from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from '../ui/calendar';
import { io } from 'socket.io-client';
import generatePDF from '../pdf_template/generatePDF';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();


const getDefaultDates = (range, month, year) => {
    let startDate, endDate;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // Get the last day of the month
    if (range === '1-15') {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month, 15);
    } else if (range === `16-${lastDayOfMonth}`) {
        startDate = new Date(year, month, 16);
        endDate = new Date(year, month, lastDayOfMonth); // Use the last day of the month
    } else {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month, lastDayOfMonth); // Use the last day of the month
    }
    return { startDate, endDate };
};

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:8080';
const socket = io(`${API_URL}`);

const getDateRange = () => {
    const today = new Date();
    const day = today.getDate();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    if (day <= 15) {
        return '1-15';
    } else {
        return `16-${lastDayOfMonth}`;
    }
};

function Payroll() {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [loadPayroll, setLoadPayroll] = useState(false)
    const limit = 15
    const [dateRange, setDateRange] = useState(getDateRange);
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [link, setLink] = useState('');
    const [open, setOpen] = useState(false)
    const [netPayDialogOpen, setNetPayDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const table = "payroll"

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    let defaultStartDate;
    let defaultEndDate;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

    if (currentDay <= 15) {
        // If the current date is on or before the 15th, set startDate to the 1st and endDate to the 15th
        defaultStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    } else {
        // If the current date is after the 15th, set startDate to the 16th and endDate to the last day of the month
        defaultStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
        defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // 0 gets the last day of the previous month
    }

    // Format the dates to 'YYYY-MM-DD'
    const formattedStartDate = format(defaultStartDate, 'yyyy-MM-dd');
    const formattedEndDate = format(defaultEndDate, 'yyyy-MM-dd');

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

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    const fetchData = async () => {
        if (filter.trim() === '') {
            setFilteredData(data);
            return;
        }
        const res = await searchPayroll(filter.trim());
        setFilteredData(res.data.data);
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('payrollUpdate', (update) => {
            console.log('Update received:', update);
            fetchpayroll()
        });

        // Cleanup on unmount
        return () => {
            socket.off('payrollUpdate');
        };
    }, []);


    const fetchpayroll = async () => {
        const response = await getPayrolls(page, limit, startDate, endDate)
        if (response) {
            setData(response.data.data)
            setTotalPages(response.data.totalPages)
            setFilteredData(response.data.data)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        fetchpayroll()
    }, [page, startDate, endDate])

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const deletePayroll = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this payroll?");

        if (!isConfirmed) {
            return;
        }

        try {
            await removePayroll(id)
            toast("Successfull", {
                description: "Deleted payroll successfully!",
            })
            setData(data.filter(item => item.id !== id))
            setFilteredData(filterData.filter(item => item.id !== id))
        } catch (error) {
            console.error('Error deleting payroll:', error);
        }
    }


    const handleExcelDownload = async () => {
        setIsLoading(true)
        try {
            const res = await exportPayroll(startDate, endDate);
            if (res.status !== 200) {
                throw new Error('Network response was not ok');
            }
            exportToCSV(res.data.data);
            setIsLoading(false)
        } catch (e) {
            console.error('Error:', e); // Log the error
            toast.error("Error", {
                description: e.message,
            });
            setIsLoading(false)
        }
    };

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
        a.setAttribute('download', 'payroll.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePayroll = async () => {
        setLoadPayroll(true)
        try {
            const res = await checkPayroll();
            console.log(res);
            if (res.status === 200) {
                toast.success("Payroll successful and ready to go!");
            }
            setLoadPayroll(false)
        } catch (e) {
            console.log(e)
            setLoadPayroll(false)
            toast.error("Error", {
                description: e.response?.data?.message || e.message,
            });
        }
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        const { startDate, endDate } = getDefaultDates(e.target.value, month, year);
        console.log(startDate, endDate)
        setStartDate(format(startDate, 'yyyy-MM-dd'));
        setEndDate(format(endDate, 'yyyy-MM-dd'));
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        const { startDate, endDate } = getDefaultDates(dateRange, e.target.value, year);
        setStartDate(format(startDate, 'yyyy-MM-dd'));
        setEndDate(format(endDate, 'yyyy-MM-dd'));
    };

    const handleYearChange = (item) => {
        console.log(item)
        setYear(item);
        const { startDate, endDate } = getDefaultDates(dateRange, month, year);
        console.log("Date", startDate, endDate)
        setStartDate(startDate);
        setEndDate(endDate);
    };

    const handleGenerate = async (data) => {
        const promise = generatePDF({ type: "payroll", data });

        toast.promise(promise, {
            loading: 'Exporting Payslips...',
            success: (link) => {
                if (link) {
                    window.open(link, '_blank');
                    setLink(link);
                    return 'Click the link';
                }
            },
            error: 'Error generating PDF',
        });

        try {
            const link = await promise;
            if (link) {
                toast('Click the link', {
                    action: {
                        label: 'Download',
                        onClick: () => downloadPDF(link)
                    },
                });
            }
        } catch (e) {
            console.log(e);
        }
    };
    
    const handleGenerateAll = async (data) => {
        try {
    
            if (!Array.isArray(data)) {
                throw new Error("Data is not an array");
            }
    
            const promise = generatePDF({ type: "admin", data });
    
            toast.promise(promise, {
                loading: "Exporting Payslips...",
                success: (link) => {
                    if (link) {
                        window.open(link, '_blank');
                        setLink(link);
                        return 'Exported Successfully!';
                    }
                },
                error: "Error generating PDF",
            });
    
            const pdfLink = await promise;
            if (pdfLink) {
                setLink(pdfLink);
                window.open(pdfLink, "_blank");
                toast('Click the link', {
                    action: {
                        label: 'Download',
                        onClick: () => downloadPDF(pdfLink)
                    },
                });
            }
        } catch (error) {
            console.error("Error generating admin PDF:", error);
            toast.error("Failed to generate PDF.");
        }
    };


    const downloadPDF = (link) => {
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.download = 'payroll.pdf';
        anchor.target = '_blank';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const handleNetPayClick = (employee) => {
        setSelectedEmployee(employee);
        setNetPayDialogOpen(true);
    };

    console.log(filterData)
    
    if (isLoading) return <Loader />

    return (
        <>
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col justify-between gap-2 py-4 md:items-center md:flex-row">
                <div className="flex flex-col gap-2 md:flex-row">
                    <Input
                        placeholder="Filter Payrolls..."
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2 md:items-center gap-s">
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {year}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-auto p-0" align="start">
                                    <ScrollArea className="max-h-[200px] overflow-y-auto">
                                        {years.map((year) => (
                                            <DropdownMenuItem  onClick={( ) => {handleYearChange(year)}} key={year} value={year}>
                                                {year}
                                            </DropdownMenuItem>
                                        ))}
                                       </ScrollArea> 
                                </DropdownMenuContent>
                            </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <span>{new Date(0, month).toLocaleString('default', { month: 'long' }) || 'Month'}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <DropdownMenuItem key={i} onClick={() => handleMonthChange({ target: { value: i } })}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center justify-between h-8">
                                    <span>{dateRange || 'Date Range'}</span><ChevronDownIcon className="w-6 h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleDateRangeChange({ target: { value: '1-15' } })}>
                                    1 - 15
                                </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDateRangeChange({ target: { value: `16-${lastDayOfMonth}` } })}>
                                    16 - {lastDayOfMonth}
                                </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDateRangeChange({ target: { value: `1-${lastDayOfMonth}` } })}>
                                    1 - {lastDayOfMonth}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button disabled={filterData.length === 0 ? true : false} size="sm" onClick={() => handleGenerateAll(filterData)} variant="outline" className="gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        Export Payslip
                    </Button>
                    <Button disabled={loadPayroll} size="sm" onClick={handlePayroll}>{loadPayroll ? <LoaderCircle className="animate-spin" /> : 'Payroll Notification'}</Button>
                </div>

            </div>
            <div className="border rounded-md">
                {filterData && filterData.length ? <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold capitalize">Name</TableHead>
                            <TableHead className="font-bold capitalize">Hierarchy</TableHead>
                            <TableHead className="font-bold capitalize">Start/End Period</TableHead>
                            <TableHead className="font-bold">Absent/s</TableHead>
                            <TableHead className="font-bold capitalize">Days/Hours Worked</TableHead>
                            <TableHead className="font-bold text-right capitalize">Gross Pay</TableHead>
                            <TableHead className="font-bold text-right capitalize">Net Pay</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filterData.map(item => {
                                const sssDeduction = item.total_pay * 0.095;
                                const philHealthDeduction = item.total_pay * 0.025;
                                const pagIbigDeduction = item.total_pay * 0.01;
                                const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
                                const netPay = item.total_pay - totalDeductions;

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-1 overflow-hidden capitalize truncate whitespace-nowrap">
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item.hierarchy}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">
                                            {`${format(new Date(item.period_start), 'MMMM d')} - ${format(new Date(item.period_end), 'd, yyyy')}`}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{item.absent}</TableCell>
                                        <TableCell className="whitespace-nowrap">{item.days_present && `(${item.days_present} Day/s)`} {item.hours_worked} Hour/s</TableCell>
                                        <TableCell className="font-bold text-right capitalize whitespace-nowrap">{formatCurrency(item.total_pay)}</TableCell>
                                        <TableCell className="font-bold text-right capitalize whitespace-nowrap" onClick={() => handleNetPayClick(item)}>{formatCurrency(netPay)}</TableCell>
                                        <TableCell className="max-w-[30px]">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="w-8 h-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                                                        Copy Payroll ID
                                                    </DropdownMenuItem> */}
                                                    <DropdownMenuItem onClick={() => handleGenerate(item)}>
                                                        Payslip
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => deletePayroll(item.id)}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
            <NetPayDialog open={netPayDialogOpen} onClose={() => setNetPayDialogOpen(false)} employee={selectedEmployee} />
        </>

    )
}

const NetPayDialog = ({ open, onClose, employee }) => {
    if (!employee) return null;

    const sssDeduction = employee.total_pay * 0.095;
    const philHealthDeduction = employee.total_pay * 0.025;
    const pagIbigDeduction = employee.total_pay * 0.01;
    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
    const netPay = employee.total_pay - totalDeductions;

    const InfoRow = ({ label, value, isDeduction }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium ">{label}</div>
            <div className={`col-span-2 text-sm ${isDeduction ? 'text-red-600' : ''} font-bold`}>{value}</div>
        </div>
    );

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl ">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold ">Net Pay Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] pr-4">
                    <div className="space-y-0">
                        <div className="p-4 mb-4 rounded-lg ">
                            <h3 className="mb-2 text-lg font-semibold ">Employee Information</h3>
                            <InfoRow label="Name" value={employee.name} />
                            <InfoRow label="Hierarchy" value={employee.hierarchy} />
                            <InfoRow label="Total Salary" value={formatCurrency(employee.total_pay)} />
                            <InfoRow label="SSS Deduction" value={formatCurrency(sssDeduction)} isDeduction />
                            <InfoRow label="PhilHealth Deduction" value={formatCurrency(philHealthDeduction)} isDeduction />
                            <InfoRow label="Pag-IBIG Deduction" value={formatCurrency(pagIbigDeduction)} isDeduction />
                            <InfoRow label="Total Deductions" value={formatCurrency(totalDeductions)} isDeduction />
                            <InfoRow label="Net Pay" value={formatCurrency(netPay)} />
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default Payroll