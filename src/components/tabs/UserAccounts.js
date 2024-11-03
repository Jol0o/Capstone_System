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
import { exportData, removeEmployee, removeUserById } from '@/lib/api';
import EditUserAccount from '../modal/EditUserAccount';

function UserAccounts() {
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [filter, setFilter] = useState('')
    const [page, setPage] = useState(1)
    const limit = 15
    const { users, userTotal } = useEmployee(page, limit)
    const table = "user"

    useEffect(() => {
        if (users) {
            setData(users);
            setFilteredData(users)
        }
    }, [users]);

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
            item.employee_id.toLowerCase().includes(filter.toLowerCase()) ||
            item.email.toLowerCase().includes(filter.toLowerCase())
        )
        setFilteredData(results);
    }, [filter])

    const deleteEmployee = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this employee?");

        if (!isConfirmed) {
            return;
        }

        try {
            await removeUserById(id);
            toast("Successfull", {
                description: "Deleted employee account successfully!",
            });
            const updatedData = data.filter((item) => item.user_id !== id);
            setData(updatedData);
            setFilteredData(updatedData);
        } catch (error) {
            console.error('Error deleting employee:', error);
            toast("Error", {
                description: "Error deleting the employee!",
            });
        }
    };

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

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
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

                </div>

            </div>
            <div className="border rounded-md">
                {filterData && filterData.length ? <Table >
                    <TableHeader>
                        <TableRow>
                            {Object.keys(filterData[0]).map((key) => {
                                if (key !== 'password' && key !== 'employee_id') {
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
                                    <TableCell className="font-medium max-w-[200px] whitespace-nowrap truncate overflow-hidden">{item.id}</TableCell>
                                    <TableCell className="font-medium max-w-[200px] whitespace-nowrap truncate overflow-hidden">
                                        {item.user_id}
                                    </TableCell>
                                    <TableCell className="capitalize whitespace-nowrap">{item.email}</TableCell>

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
                                                onClick={() => navigator.clipboard.writeText(item.user_id)}
                                            >
                                                Copy Candidate ID
                                            </DropdownMenuItem>
                                            <EditUserAccount id={item.id} />
                                            <DropdownMenuItem
                                                onClick={() => deleteEmployee(item.user_id)}
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
                    {userTotal === '1' && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>}
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    {userTotal !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>}
                </div>
            </div>}
        </div>
    )
}

export default UserAccounts