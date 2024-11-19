'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, FileDown, LoaderCircle, MoreHorizontal, User } from "lucide-react";
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
import { checkPayroll, exportData, getPayrolls, removePayroll, searchPayroll } from '@/lib/api';
import * as XLSX from 'xlsx';
import Loader from '../Loader';

function Payroll() {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [loadPayroll, setLoadPayroll] = useState(false)
    const limit = 15
    const table = "payroll"

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }


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

    useEffect(() => {
        setIsLoading(true)
        const fetchpayroll = async () => {
            const response = await getPayrolls(page, limit)
            if (response) {
                console.table('Payroll', response.data)
                setData(response.data.data)
                setTotalPages(response.data.totalPages)
                setFilteredData(response.data.data)
                setIsLoading(false)
            }
        }
        fetchpayroll()
    }, [page])

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const deletePayroll = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this employee?");

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

    if (isLoading) return <Loader />

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter Payrolls..."
                    onChange={(event) => setFilter(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-1">
                    <Button disabled={filterData.length === 0 ? true : false} size="sm" onClick={() => handleExcelDownload(filterData)} variant="outline" className="gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <Button disabled={loadPayroll} size="sm" onClick={handlePayroll}>{loadPayroll ? <LoaderCircle className="animate-spin" /> : 'Send Payroll'}</Button>
                </div>
            </div>
            <div className="border rounded-md">
                {filterData && filterData.length ? <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="capitalize">Name</TableHead>
                            <TableHead className="capitalize">Created At</TableHead>
                            <TableHead className="capitalize">Hours Worked</TableHead>
                            <TableHead className="capitalize">Total Pay</TableHead>
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
                                    <TableCell className="capitalize whitespace-nowrap">{item.hours_worked} Hours</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">PHP {item.total_pay}</TableCell>
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
                                                Copy Payroll ID
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => deletePayroll(item.id)}
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

export default Payroll