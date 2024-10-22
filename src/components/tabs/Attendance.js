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
import { useRouter } from 'next/navigation';
import generate from '../pdf_template/generatePDF';
import { getAttendance, removeAttendance, searchAttendance } from '@/lib/api';
import * as XLSX from 'xlsx';
import Loader from '../Loader';

function Attendance() {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const limit = 15
    const { token } = useAuth()
    const router = useRouter()
    const [filter, setFilter] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
            const response = await getAttendance(page, limit, token)
            if (response) {
                console.log(response.data)
                setTotalPages(response.data.totalPages)
                setData(response.data.data)
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

    const deleteAttendance = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this employee?");

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

    const handleGenerate = async () => {
        const link = await generate();
        console.log(link);
        window.open(link, '_blank');
    }

    const handleExcelDownload = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "attendance.xlsx");
    };

    if (isLoading) return <Loader />

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter Attendance..."
                    onChange={(event) => setFilter(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGenerate} className="flex items-center gap-2">Genarate</Button>
                    <Button disabled={filterData.length === 0} onClick={() => handleExcelDownload(filterData)} variant="outline" className="gap-1">
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
                                    <TableCell className="capitalize whitespace-nowrap">{item.time_in}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.time_out}</TableCell>
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