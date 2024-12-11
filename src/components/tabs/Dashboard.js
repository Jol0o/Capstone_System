'use client'
import useAnalytics from '@/hooks/useAnalytics';
import axios from 'axios';
import { Users, Clock, UserX, UserMinus, Moon, Sun, Timer, TimerOff } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, BarElement } from 'chart.js';
import { LineChart } from '../chart/LinceChart';
import { BarChartComponent } from '../chart/BarChart';
import { Card, CardTitle, CardContent, CardHeader } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getMonthlyAttendance, getYearlyAttendance } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, BarElement);

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

function Dashboard() {
  const { earlyBirds, lates, earlyDepartures, absents, off, employee, } = useAnalytics()
  const time = new Date();
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [monthly, setMonthly] = useState(null)
  const [yearly, setYearly] = useState(null)
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [currentTime, setCurrentTime] = useState(new Date())
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchMonthly = async () => {
    const response = await getMonthlyAttendance(month, year);
    setMonthly(response.data.data);
  };

  const fetchYearly = async (year) => {
    const response = await getYearlyAttendance(year);
    setYearly(response.data.data);
  };


  useEffect(() => {
    fetchMonthly()
    fetchYearly()
  }, [year, month])

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  console.log(lates)

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 md:col-span-4">
          <CardHeader>
            <CardTitle>Real-time Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {currentTime.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentTime.toDateString()}
            </p>
          </CardContent>
        </Card>
        <div className="col-span-3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Employees"
              value={employee?.this_month || 0}
              icon={Users}
              description={
                employee?.difference
                  ? employee.difference > 0
                    ? `+${employee.difference} New employees added!`
                    : `${employee.difference} Employees removed!`
                  : "No change in employees."
              }
              trend={employee?.difference > 0 ? "increase" : employee?.difference < 0 ? "decrease" : "neutral"}
            />
            <StatCard
              title="On Time"
              value={earlyBirds?.today || 0}
              icon={Timer}
              description={
                earlyBirds?.difference
                  ? earlyBirds.difference > 0
                    ? `+${earlyBirds.difference} Increase than yesterday!`
                    : `${earlyBirds.difference} Decrease than yesterday!`
                  : "No change compared to yesterday."
              }
              trend={earlyBirds?.difference > 0 ? "increase" : earlyBirds?.difference < 0 ? "decrease" : "neutral"}
            />
            <StatCard
              title="Absents"
              value={absents?.today || 0}
              icon={TimerOff}
              description="No change compared to yesterday."
              trend="neutral"
            />
            <StatCard
              title="Late Arrivals"
              value={lates?.today || 0}
              icon={TimerOff}
              description={
                lates?.difference
                  ? lates.difference < 0
                    ? `+${Math.abs(lates.difference)} Decrease than yesterday!`
                    : `${lates.difference} Increase than yesterday!`
                  : "No change compared to yesterday."
              }
              trend={lates?.difference < 0 ? "decrease" : lates?.difference > 0 ? "increase" : "neutral"}
            />
            <StatCard
              title="Early Departures"
              value={earlyDepartures?.today || 0}
              icon={Moon}
              description={
                earlyDepartures?.difference
                  ? earlyDepartures.difference > 0
                    ? `+${earlyDepartures.difference} Decrease than yesterday!`
                    : `${earlyDepartures.difference} Increase than yesterday!`
                  : "No change compared to yesterday."
              }
              trend={earlyDepartures?.difference > 0 ? "decrease" : earlyDepartures?.difference < 0 ? "increase" : "neutral"}
            />
            <StatCard
              title="Day Off"
              value={off || 0}
              icon={Sun}
              description="No data available for yesterday."
              trend="neutral"
            />

          </div>

        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-sm font-400">
        Filter:
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
            <Button variant="outline" size="sm" className="h-8">
              <span>{year || 'Year'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {years.map((yr) => (
              <DropdownMenuItem key={yr} onClick={() => handleYearChange({ target: { value: yr } })}>
                {yr}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid w-full grid-cols-1 gap-5 mt-2 lg:grid-cols-2">
        <LineChart data={monthly} />
        <BarChartComponent data={yearly} />
        {absents?.absentToday.length > 0 && <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {absents?.absentToday.map((name, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{name}</p>
                      <p className="text-sm text-muted-foreground">Absent</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, description, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={`text-xs ${trend === "increase"
              ? "text-green-500"
              : trend === "decrease"
                ? "text-red-500"
                : "text-muted-foreground"
            }`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


export default Dashboard