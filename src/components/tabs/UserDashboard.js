'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, Clock, PhilippinePeso, FileText, User, ChevronLeft, ChevronRight, Filter, LoaderCircle, FileDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useAuth from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore';
import Loader from '../Loader'
import { format, getDaysInMonth } from 'date-fns';
import { getEmployeeById, getUserAttendance, getUserDataDashboard, getDeductionRates } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import cn from 'classnames';
import { ScrollArea } from "@/components/ui/scroll-area";
import * as XLSX from 'xlsx';

// Mock data - replace with actual API calls
const userDatas = {
  name: "John Doe",
  position: "Software Engineer",
  department: "Engineering",
  avatar: "https://res.cloudinary.com/dkibnftac/image/upload/v1736055684/472310634_573909112071832_6346957760146667703_n_ltzgz5.png",
}

const getDateRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  if (day <= 15) {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month, 15)
    };
  } else {
    return {
      start: new Date(year, month, 16),
      end: new Date(year, month, lastDayOfMonth)
    };
  }
};

export default function UserDashboard() {
  const { user } = useAuth();
  const userEmail = useStore(state => state.userEmail);
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [yearData, setYearData] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const limit = 5
  const [deductionRates, setDeductionRates] = useState(undefined); // Start as undefined
  const [isDeductionLoading, setIsDeductionLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsDeductionLoading(true);
      const res = await getDeductionRates();
      if (res.success) {
        setDeductionRates({
          sss: res.rates.sss_rate,
          philhealth: res.rates.philhealth_rate,
          pagibig: res.rates.pagibig_rate,
        });
      } else {
        setDeductionRates({ sss: 0, philhealth: 0, pagibig: 0 });
      }
      setIsDeductionLoading(false);
    };
    fetchRates();
  }, []);


  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 15);

  const { start, end } = getDateRange();

  // Format the dates to 'YYYY-MM-DD'
  const formattedStartDate = format(start, 'yyyy-MM-dd');
  const formattedEndDate = format(end, 'yyyy-MM-dd');


  const [startDate, setStartDate] = useState(formattedStartDate);
  const [endDate, setEndDate] = useState(formattedEndDate);
  const [loadingAttendance, setLoadingAttendance] = useState(false)


  const fetchDashboardData = async () => {
    try {
      const res = await getUserDataDashboard(user.user_id)
      if (res.status === 200) {
        setDashboardData(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const fetchUser = useCallback(async () => {
    const id = userEmail ? userEmail : user?.user_id;
    setLoading(true)
    try {
      if (id) {
        const response = await getEmployeeById(id);
        if (response.data) {
          const userData = response.data[0];
          setUserData(userData);
          setLoading(false)
        }
      }
    } catch (e) {
      console.log(e);
      setLoading(false)
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
    fetchDashboardData()
  }, [fetchUser, user]);

  useEffect(() => {
    const id = userData?.employee_id;
    if (!id) return;
    setLoadingAttendance(true)
    const fetchAttendance = async () => {
      try {
        const res = await getUserAttendance(id, startDate, endDate, page);
        if (res.status === 200) {
          setTotalPages(res.data.totalPages)
          setYearData(res.data.data);
          setLoadingAttendance(false)
        }
      } catch (error) {
        setLoadingAttendance(false)
        console.error('Error fetching attendance:', error);
      }
    };
    fetchAttendance();
  }, [userData, startDate, endDate, page]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading || isDeductionLoading || !deductionRates) return <Loader />;


  const getStatusVariant = (status) => {
    switch (status) {
      case "present":
        return "success"; // Green
      case "late":
        return "destructive"; // Yellow
      case "absent":
        return "destructive"; // Red
      case "off duty":
        return "destructive"; // Orange
      default:
        return "default"; // Default color
    }
  };

  const handleNext = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrev = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
  };

  const calculateAttendancePercentage = (totalDays) => {
    const currentDate = new Date();
    const totalDaysInMonth = getDaysInMonth(currentDate);
    const attendancePercentage = (totalDays / totalDaysInMonth) * 100;
    return attendancePercentage.toFixed(2); // Format to 2 decimal places
  };

  const handleExcelDownload = (data) => {
    // Remove employee_id from each data object
    const filteredData = data.map(({ employee_id, ...rest }) => rest);

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "attendance.xlsx");
  };

  const attendancePercentage = calculateAttendancePercentage(dashboardData?.totalDays);

  return (
    <div className="container mx-auto space-y-6 md:p-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Employee Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Leave Days Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.leaveCredits} days</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {dashboardData?.usedLeaveDays} used, {dashboardData?.pendingLeaveRequests} pending
            </p>
          </CardContent>
        </Card>

        {/* Last Payroll Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Last Payroll</CardTitle>
            <span className="w-4 h-4 text-muted-foreground">₱</span>
          </CardHeader>
          <CardContent>
            {dashboardData && dashboardData.latestPayroll ? <><div className="text-2xl font-bold">{formatCurrency(dashboardData?.latestPayroll.total_pay)}</div>
              <p className="text-xs text-muted-foreground">{formatDate(dashboardData?.latestPayroll.created_at)}</p>
            </> : <div className="text-2xl font-bold">0</div>}
          </CardContent>
        </Card>

        {/* Attendance Rate Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${attendancePercentage < 70 ? 'text-red-500' : ''}`}>
              {attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.pendingLeaveRequests}</div>
            <p className="text-xs text-muted-foreground">Leave requests awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Information Card */}
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData && userData.avatar ? userData.avatar : userDatas.avatar} alt={userDatas.name} />
                <AvatarFallback>
                  {userData ? userData.name.split(' ').map(n => n[0]).join('') : 'JD'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold sm:text-2xl">{userData ? userData.name : 'John Doe'}</h2>
                <p className="text-muted-foreground">{userData ? userData.position : 'Software Engineer'}</p>
                <p className="text-muted-foreground">{userData ? userData.department : 'Engineering'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            <Clock className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Working Days</span>
                <span className="text-sm text-zinc-400">Monday - Saturday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Working Hours</span>
                <span className="text-sm text-zinc-400">8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Attendance Card */}
        <Card >
          <CardHeader className="flex flex-col p-2 pb-4 space-y-4 md:p-6 md:flex-row">
            <div className="flex flex-col justify-between w-full gap-2 md:flex-row md:items-center">
              <div>
                <CardTitle className="text-xl font-semibold ">Recent Attendance</CardTitle>
                <CardDescription>Your attendance for the last 5 working days</CardDescription>
              </div>
              <div className="flex items-center gap-4">
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
                          date < new Date("1900-01-01") || (startDate && date < new Date(startDate))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button size="sm" variant="secondary" className="h-8" onClick={() => handleExcelDownload(yearData)}>
                  <FileDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
              {!loadingAttendance ? <ScrollArea className="custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="font-medium">Check In</TableHead>
                      <TableHead className="font-medium">Check Out</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearData.map((record) => (
                      <TableRow key={record.date} className="border-gray-800 hover:bg-transparent">
                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <div >
                              {format(new Date(record.date), "MMM d,")}
                            </div>
                            <div className="text-sm ">
                              {format(new Date(record.date), "yyyy")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell >{record.time_in || "-"}</TableCell>
                        <TableCell >{record.time_out || "-"}</TableCell>
                        <TableCell>
                          <Badge className="capitalize" variant={getStatusVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea> :
                <div className="flex items-center justify-center w-full h-[200px]">
                  <LoaderCircle className="animate-spin" />
                </div>
              }
            </div>
          </CardContent>
          <CardFooter clasName="p-2 md:p-6">
            {yearData.length > 0 && <div className="flex items-center justify-end w-full pt-2">

              <div className="flex items-center gap-2">
                {page !== 1 && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>}
                <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                {totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>}
              </div>
            </div>}
          </CardFooter>
        </Card>

        {/* Recent Payrolls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payrolls</CardTitle>
            <CardDescription>Your last 3 months of payroll</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto custom-scrollbar max-h-[300px]">
              <ScrollArea className="custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.allPayroll && dashboardData.allPayroll.map((payroll, index) => {
                      const sssDeduction = payroll.totalSalary * (deductionRates?.sss ?? 0);
                      const philHealthDeduction = payroll.totalSalary * (deductionRates?.philhealth ?? 0);
                      const pagIbigDeduction = payroll.totalSalary * (deductionRates?.pagibig ?? 0);
                      const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + payroll.lateDeduction + payroll.undertimeDeduction;

                      // Calculate net pay
                      const netPay = payroll.total_pay - totalDeductions;

                      return (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payroll.period_start)}</TableCell>
                          <TableCell>{formatCurrency(netPay)}</TableCell>
                          <TableCell>
                            {payroll.hours_worked} Hours
                          </TableCell>
                        </TableRow>)
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
