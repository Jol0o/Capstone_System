'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, MoreHorizontal, User, FileDown, ListFilter, ChevronLeft, ChevronRight } from "lucide-react";
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
import AddEmployee from '../modal/AddEmployee';
import { toast } from 'sonner';
import Image from 'next/image';
import EditEmployee from '../modal/EditEmployee';
import useEmployee from '@/hooks/useEmployee';
import useAuth from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { removeEmployee, sendEmailToEmployee } from '@/lib/api';

function Employee({ setTab }) {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [filter, setFilter] = useState('')
    const [page, setPage] = useState(1)
    const limit = 15
    const { employee, totalPages } = useEmployee(page, limit)
    const { token } = useAuth()
    const setUser = useStore(state => state.setUser)

    useEffect(() => {
        if (employee) {
            setData(employee);
            setFilteredData(employee)
        }
    }, [employee]);

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    useEffect(() => {
        if (!filter) {
            setFilteredData(data)
            return;
        }
        const results = data.filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            item.email.toLowerCase().includes(filter.toLowerCase()) ||
            item.department.toLowerCase().includes(filter.toLowerCase()) ||
            item.position.toLowerCase().includes(filter.toLowerCase()) ||
            item.phone_number.toLowerCase().includes(filter.toLowerCase())
        )
        setFilteredData(results);
    }, [filter])

    const deleteEmployee = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this employee?");

        if (!isConfirmed) {
            return;
        }

        try {
            await removeEmployee(id, token);
            toast("Successfull", {
                description: "Deleted employee successfully!",
            });
            const updatedData = data.filter((item) => item.id !== id);
            setData(updatedData);
            setFilteredData(updatedData);
        } catch (error) {
            console.error('Error deleting employee:', error);
            toast("Error", {
                description: "Error deleting the employee!",
            });
        }
    };

    const handleExcelDownload = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "csv.xlsx");
    };

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleEmail = async (item) => {
        if (!item) return;

        try {
            await sendEmailToEmployee(item, token)
            toast("Successful", {
                description: "Email Sent!",
            });
        } catch (error) {
            toast("Error", {
                description: error.response?.data?.message || "An error occurred",
            });
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter Employee Name..."
                    onChange={(event) => setFilter(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-3">

                    <Button onClick={() => handleExcelDownload(filterData)} variant="outline" size="sm" className="gap-1 h-7">
                        <FileDown className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <AddEmployee />
                </div>

            </div>
            <div className="border rounded-md">
                {filterData && filterData.length ? <Table >
                    <TableHeader>
                        <TableRow>
                            {Object.keys(filterData[0]).map((key) => {
                                if (key !== 'created_at' && key !== 'qrcode' && key !== 'id' && key !== 'avatar' && key !== 'password') {
                                    // Replace all occurrences of "_" with a space
                                    let formattedKey = key.replace(/_/g, ' ');
                                    return <TableHead className="capitalize" key={key}>{formattedKey}</TableHead>;
                                }
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filterData.map(item =>
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium max-w-[200px] whitespace-nowrap truncate overflow-hidden">{item.employee_id}</TableCell>
                                    <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                        {item.avatar ? <Image src={item.avatar} alt={item.avatar} width={36}
                                            height={36}
                                            className="object-cover overflow-hidden rounded-full max-h-7" /> : <User />}
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{formatDate(item.salary_date)}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.department}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.position}</TableCell>
                                    <TableCell className="capitalize max-w-[300px] truncate whitespace-nowrap">{item.email}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.phone_number}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.salary}</TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.day_off === 1 ? 'Off' : 'On'}</TableCell>
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
                                                Copy Candidate ID
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setTab("profile")
                                                setUser(item.email)
                                            }}>
                                                View
                                            </DropdownMenuItem>
                                            <EditEmployee id={item.id} />
                                            <DropdownMenuItem onClick={() => handleEmail(item)}>
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => deleteEmployee(item.employee_id)}
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
                <div className="flex-1 text-sm text-muted-foreground">
                    {filterData.length} of{" "}
                    {data.length} row(s) selected.
                </div>
                <div className="flex items-center gap-2">
                    {totalPages === '1' && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>}
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    {totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>}
                </div>
            </div>}
        </div>
    )
}

export default Employee