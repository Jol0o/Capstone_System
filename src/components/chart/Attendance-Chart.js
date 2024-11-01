import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getUserAttendance } from '@/lib/api'

const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function EmployeeAttendance({ id }) {
    const [selectedYear, setSelectedYear] = useState("2024")
    const [userAttendance, setUserAttendance] = useState([])
    const [yearData, setYearData] = useState([])
    const [hoveredDate, setHoveredDate] = useState(null)

    useEffect(() => {
        if (!id) return
        const fetchAttendance = async () => {
            try {
                const res = await getUserAttendance(id)
                if (res.status === 200) {
                    setUserAttendance(res.data.data)
                }
            } catch (error) {
                console.error('Error fetching attendance:', error)
            }
        }

        fetchAttendance()
    }, [id])

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-emerald-500'
            case 'late': return 'bg-yellow-500'
            case 'absent': return 'bg-red-500'
            case 'no-data': return 'bg-gray-700'
            default: return 'bg-gray-700'
        }
    }

    const generateYearData = (year, attendance) => {
        const yearData = []
        const startDate = new Date(`${year}-05-01`) // Start from May
        const endDate = new Date(`${year}-12-31`) // End at December

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const existingData = attendance.find(item => item.date === d.toISOString().split('T')[0])
            yearData.push({
                date: d.toISOString().split('T')[0],
                day: days[d.getDay()],
                status: existingData ? existingData.status : 'no-data'
            })
        }

        return yearData
    }

    useEffect(() => {
        if (userAttendance.length > 0) {
            const newYearData = generateYearData(selectedYear, userAttendance)
            setYearData(newYearData)
        }
    }, [selectedYear, userAttendance])

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="w-full py-5 m-auto max-w-[1000px]">
            <Card className="border-gray-800 ">
                <CardHeader>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="text-white">Employee Attendance</CardTitle>
                            <CardDescription className="text-gray-400">Attendance overview for the year</CardDescription>
                        </div>
                        <Select defaultValue={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[180px] bg-transparent border-gray-800 text-white">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {[2023, 2024, 2025].map((year) => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full rounded-md">
                        <div className="p-4">
                            <div className="relative">
                                <div className="flex mb-2">
                                    <div className="w-12" />
                                    {months.map((month) => (
                                        <div key={month} className="flex-1 text-center text-sm text-gray-400 min-w-[80px]">
                                            {month}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    {days.map((day, dayIndex) => (
                                        <div key={day} className="flex items-center h-8">
                                            <div className="w-12 text-sm text-gray-400">{day}</div>
                                            <div className="flex flex-1">
                                                {months.map((month, monthIndex) => (
                                                    <div key={month} className="flex-1 min-w-[80px] px-1">
                                                        <div className="grid grid-cols-5 gap-[2px]">
                                                            {yearData
                                                                .filter(data =>
                                                                    new Date(data.date).getMonth() === monthIndex + 4 &&
                                                                    new Date(data.date).getDay() === (dayIndex === 6 ? 0 : dayIndex + 1)
                                                                )
                                                                .map((dayData, index) => (
                                                                    <TooltipProvider key={index}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                onMouseEnter={() => setHoveredDate(dayData.date)}
                                                                                onMouseLeave={() => setHoveredDate(null)}
                                                                            >
                                                                                <div
                                                                                    className={`w-3 h-3 rounded-md ${getStatusColor(dayData.status)}`}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-gray-900 border-gray-800">
                                                                                <p className="text-white">
                                                                                    {hoveredDate === dayData.date ?
                                                                                        `${formatDate(dayData.date)}: ${dayData.status.charAt(0).toUpperCase() + dayData.status.slice(1)}` :
                                                                                        dayData.date
                                                                                    }
                                                                                </p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500" />
                                    <span>Present</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500" />
                                    <span>Late</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500" />
                                    <span>Absent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-700" />
                                    <span>No Data</span>
                                </div>
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}