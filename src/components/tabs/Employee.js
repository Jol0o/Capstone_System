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
import { removeEmployee, searchEmployee, sendEmailToEmployee, getEmployeeRequest, removeEmployeeRequest, exportData, getDeductionRates } from '@/lib/api';
import Loader from '../Loader';
import ApproveEmployee from '../modal/ApproveEmployee';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function Employee({ setTab }) {
    const [data, setData] = useState([])
    const [employeeData, setEmployeeData] = useState([])
    const [filterData, setFilteredData] = useState([])
    const [filter, setFilter] = useState(' ')
    const [page, setPage] = useState(1)
    const [employeePage, setEmployeePage] = useState(1)
    const limit = 15
    const { employee, totalPages, requests, employeeTotal } = useEmployee(page, limit, employeePage)
    const { token } = useAuth()
    const setUser = useStore(state => state.setUser)
    const [isLoading, setIsloading] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [open, setOpen] = useState(false)
    const [netPayDialogOpen, setNetPayDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [deductionRates, setDeductionRates] = useState(undefined); // Start as undefined
    const [isDeductionLoading, setIsDeductionLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            setIsDeductionLoading(true);
            const res = await getDeductionRates();
            if (res.success) {
                setDeductionRates({
                    sss: res.rates.sss ?? 0.095,
                    philhealth: res.rates.philhealth ?? 0.025,
                    pagibig: res.rates.pagibig ?? 0.01,
                });
            } else {
                setDeductionRates({ sss: 0.095, philhealth: 0.025, pagibig: 0.01 });
            }
            setIsDeductionLoading(false);
        };
        fetchRates();
    }, []);

    const table = "employees"

    useEffect(() => {
        setIsloading(true)
        if (employee) {
            setData(employee);
            setFilteredData(employee)
            setIsloading(false)
            setEmployeeData(requests)
        }
    }, [employee, requests]);


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
            const res = await searchEmployee(filter.trim());
            setFilteredData(res.data.data);
        };

        fetchData();
    }, [filter]);

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

    const handleExcelDownload = async () => {
        try {
            const res = await exportData(table);

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

    const InfoRow = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium text-gray-400">{label}</div>
            <div className="col-span-2 text-sm text-white">{value}</div>
        </div>
    )


    if (isLoading || isDeductionLoading || !deductionRates) return <Loader />;


    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    const camelCaseToWords = (str) => {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    };

    const handleNetPayClick = (employee) => {
        setSelectedEmployee(employee);
        setNetPayDialogOpen(true);
    };



    return (
        <>
            <div className="w-full">
                <div className="flex flex-col items-center justify-between py-4 md:flex-row">
                    <Input
                        placeholder="Filter Employee Name..."
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex gap-3">

                        <Button disabled={filterData.length === 0} onClick={() => handleExcelDownload(filterData)} variant="outline" size="sm" className="gap-1 h-7">
                            <FileDown className="h-3.5 w-3.5" />
                            Export
                        </Button>
                        {/* <AddEmployee /> */}
                    </div>

                </div>
                <div className="border rounded-md">
                    <h1 className="p-5">Employee Table</h1>
                    {filterData && filterData.length ? <Table >
                        <TableHeader>
                            <TableRow>
                                {Object.keys(filterData[0])
                                    .filter(key => !['created_at', 'qrcode', 'id', 'avatar', 'password', 'employee_id', 'monthSalary', 'leaveCredits', 'lateDeduction', 'undertimeDeduction'].includes(key))
                                    .map(key => {
                                        if (key === 'day_off') return 'status';
                                        if (key === 'email') return 'email address';
                                        if (key === 'basicSalary') return 'Gross Pay';
                                        if (key === 'totalSalary') return 'Net Pay';
                                        return key;
                                    })
                                    .sort((a, b) => {
                                        // Ensure Gross Pay and Net Pay are at the end, next to each other
                                        const customOrder = ['Gross Pay', 'Net Pay'];
                                        if (customOrder.includes(a) && customOrder.includes(b)) {
                                            return customOrder.indexOf(a) - customOrder.indexOf(b);
                                        }
                                        if (customOrder.includes(a)) return 1; // Push Gross Pay and Net Pay to the end
                                        if (customOrder.includes(b)) return -1;
                                        return 0; // Maintain default order for other keys
                                    })
                                    .reduce((acc, key) => {
                                        acc.push(key);
                                        if (key === 'hierarchy') {
                                            acc.push('rate');
                                        }
                                        return acc;
                                    }, [])
                                    .map((key) => {
                                        // Convert camel case to separate words by space
                                        let formattedKey = camelCaseToWords(key);
                                        return <TableHead className="font-bold capitalize" key={key}>{formattedKey}</TableHead>;
                                    })}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                filterData.map(item => {
                                    const sssDeduction = item.totalSalary * (deductionRates?.sss ?? 0);
                                    const philHealthDeduction = item.totalSalary * (deductionRates?.philhealth ?? 0);
                                    const pagIbigDeduction = item.totalSalary * (deductionRates?.pagibig ?? 0);
                                    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + item.lateDeduction + item.undertimeDeduction;
                                    const netPay = item.totalSalary - totalDeductions;

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">{item.department}</TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">{item.position}</TableCell>
                                            <TableCell className="whitespace-nowrap">{item.email}</TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">{item.phone_number}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={item.hierarchy === "Managerial" ? "default" : item.hierarchy === "Supervisor" ? "secondary" : "outline"}>
                                                    {item.hierarchy}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">{item.hierarchy === 'Rank & File' ? 'Daily' : 'Monthly'}</TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">
                                                <Badge className={item.day_off === 0 ? 'bg-green-500' : 'bg-red-500'}>
                                                    {item.day_off === 0 ? 'On Duty' : 'Off Duty'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize whitespace-nowrap">
                                                {item.approved_by}
                                            </TableCell>
                                            <TableCell className="capitalize max-w-[300px]  font-bold truncate whitespace-nowrap">
                                                {formatCurrency(item.basicSalary)}
                                            </TableCell>
                                            <TableCell className="capitalize max-w-[300px]  font-bold truncate whitespace-nowrap cursor-pointer" onClick={() => handleNetPayClick(item)}>
                                                {formatCurrency(netPay)}
                                            </TableCell>
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
                                                        {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.employee_id)}>
                                                            Copy Candidate ID
                                                        </DropdownMenuItem> */}
                                                        <DropdownMenuItem onClick={() => {
                                                            setTab("profile");
                                                            setUser(item.employee_id);
                                                        }}>
                                                            Manage Account
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => deleteEmployee(item.employee_id)}>
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
                        {totalPages !== '1' && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>}
                        <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                        {totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>}
                    </div>
                </div>}
                <div className="mt-5 border rounded-md">
                    <h1 className="p-5">Request for Account Approval</h1>
                    {employeeData && employeeData.length ? <Table >
                        <TableHeader>
                            <TableRow>
                                {Object.keys(employeeData[0]).map((key) => {
                                    if (key !== 'created_at' && key !== 'qrcode' && key !== 'id' && key !== 'avatar' && key !== 'password' && key !== 'employee_id') {
                                        // Replace all occurrences of "_" with a space
                                        let formattedKey = key.replace(/_/g, ' ');
                                        return <TableHead className="capitalize" key={key}>{formattedKey}</TableHead>;
                                    }
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                employeeData.map(item =>
                                    <TableRow key={item.id}>
                                        <TableCell className="flex items-center gap-1 capitalize whitespace-nowrap max-w-[200px] truncate overflow-hidden">
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate whitespace-nowrap">{item.email}</TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{item.phone_number}</TableCell>
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
                                                <ApproveEmployee data={item} />
                                                {/* <DropdownMenuItem onClick={() => {
                                                    setSelectedData(item)
                                                    setOpen(true)
                                                }}>View</DropdownMenuItem> */}
                                                <DropdownMenuItem onClick={() => removeEmployeeRequest(item.id)}>
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
                {employeeData.length > 0 && <div className="flex items-center justify-end py-4 space-x-2">
                    <div className="flex items-center gap-2">
                        {employeeTotal !== '1' && <Button variant="ghost" className="w-8 h-8 p-0" onClick={() => setEmployeePage(prevPage => Math.max(prevPage - 1, 1))}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>}
                        <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{employeePage}</p>
                        {employeeTotal !== employeePage && <Button variant="ghost" className="w-8 h-8 p-0" onClick={() => setEmployeePage(prevPage => prevPage + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>}
                    </div>
                </div>}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl bg-black border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">Employee Request Details</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] pr-4">
                        <div className="space-y-0">
                            <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                                <h3 className="mb-2 text-lg font-semibold text-white">Employee Information</h3>
                                <InfoRow label="Name" value={selectedData?.name} />
                                <InfoRow label="Email" value={selectedData?.email} />
                                <InfoRow label="Phone Number" value={selectedData?.phone_number} />
                                <InfoRow
                                    label="Status"
                                    value={
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${selectedData?.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                selectedData?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'}`}
                                        >
                                            {selectedData?.status}
                                        </span>
                                    }
                                />
                            </div>

                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <NetPayDialog open={netPayDialogOpen} onClose={() => setNetPayDialogOpen(false)} employee={selectedEmployee} deductionRates={deductionRates} />
        </>
    )
}


const NetPayDialog = ({ open, onClose, employee, deductionRates }) => {
    if (!employee) return null;

    const sssDeduction = employee.totalSalary * (deductionRates?.sss ?? 0);
    const philHealthDeduction = employee.totalSalary * (deductionRates?.philhealth ?? 0);
    const pagIbigDeduction = employee.totalSalary * (deductionRates?.pagibig ?? 0);
    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + employee.lateDeduction + employee.undertimeDeduction;
    const netPay = employee.totalSalary - totalDeductions;

    const InfoRow = ({ label, value, isDeduction }) => (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-400">
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
            <DialogContent className="max-w-2xl border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold ">Net Pay Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] pr-4">
                    <div className="space-y-0">
                        <div className="p-4 mb-4 rounded-lg ">
                            <h3 className="mb-2 text-lg font-semibold ">Employee Information</h3>
                            <InfoRow label="Name" value={employee.name} />
                            <InfoRow label="Department" value={employee.department} />
                            <InfoRow label="Position" value={employee.position} />
                            <InfoRow label="Total Salary" value={formatCurrency(employee.totalSalary)} />
                            <InfoRow label="SSS Deduction" value={formatCurrency(sssDeduction)} isDeduction />
                            <InfoRow label="PhilHealth Deduction" value={formatCurrency(philHealthDeduction)} isDeduction />
                            <InfoRow label="Pag-IBIG Deduction" value={formatCurrency(pagIbigDeduction)} isDeduction />
                            <InfoRow label="Late Deduction" value={formatCurrency(employee.lateDeduction)} isDeduction />
                            <InfoRow label="Undertime Deduction" value={formatCurrency(employee.undertimeDeduction)} isDeduction />
                            <InfoRow label="Total Deductions" value={formatCurrency(totalDeductions)} isDeduction />
                            <InfoRow label="Net Pay" value={formatCurrency(netPay)} />
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
export default Employee