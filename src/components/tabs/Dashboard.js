'use client'
import useAnalytics from '@/hooks/useAnalytics';
import axios from 'axios';
import { CalendarClock, CirclePlus, Cloud, Moon, Sun, Timer, TimerOff, TrendingDown, TrendingUp, Users } from 'lucide-react'
import React, { useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, BarElement);

function Dashboard() {
  const { earlyBirds, lates, earlyDepartures, absents, off, employee, yearly, monthly } = useAnalytics()
  const time = new Date();
  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  console.log(employee)

  const data = {
    labels: monthly && monthly.map((item) => item.day),
    datasets: [
      {
        label: 'My First dataset',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: monthly && monthly.map((item) => item.attendance_count)
      }
    ]
  };

  const options = {
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          title: function (context) {
            return 'Title: ' + context[0].label;
          },
          label: function (context) {
            return 'Value: ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  const dataYearly = {
    labels: yearly && yearly.map((item) => item.month),
    datasets: [
      {
        label: 'My First dataset',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: yearly && yearly.map((item) => item.attendance_count)
      }
    ]
  };
  return (
    <div className="w-full h-full overflow-hidden">
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className='flex flex-col justify-between border-2 rounded-md w-full  h-[300px] p-5'>
          <div className="flex items-center justify-between">
            <Sun className="w-20 h-20" />
            <div>
              <h3 className="text-3xl font-medium">{formattedTime}</h3>
              <p className="text-sm font-normal text-slate-500">Realtime Insight</p>
            </div>
          </div>
          <div className="flex-end">
            <h3 className="font-medium text-md">Today</h3>
            <p className="text-3xl font-normal text-slate-400">{date}</p>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{employee?.this_month}</h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">Total Employees</h2>
              <div className="flex items-center gap-2">
                <CirclePlus className={`w-4 h-4 ${employee && employee.difference >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                {employee && employee.difference >= 0 ? <p className="text-xs text-green-500">+{employee.difference} New employees added!</p> : <p className="text-red-500">{employee && employee.difference}</p>}
              </div>
            </div>
          </div>
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {lates && lates.today}
              </h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <TimerOff className="w-6 h-6 " />
              </div>

            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">Late Arrivals</h2>
              <div className="flex items-center gap-2">
                {lates && lates.difference <= 0 ? <TrendingUp className={`w-4 h-4 ${lates ? (lates.difference >= 0 ? 'text-green-500' : 'text-red-500') : ''}`} /> : <TrendingDown className={`w-4 h-4 ${lates ? (lates.difference >= 0 ? 'text-green-500' : 'text-red-500') : ''}`} />}
                {lates ? (lates.difference >= 0 ? <p className="text-xs text-green-500">+{lates.difference} Decrease than yesterday!</p> : <p className="text-xs text-red-500">{lates.difference} Increase than yesterday!</p>) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{earlyBirds && earlyBirds.today}</h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <Timer className="w-6 h-6" />
              </div>

            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">On Time</h2>
              <div className="flex items-center gap-2">
                {earlyBirds && earlyBirds.difference >= 0 ? <TrendingUp className={`w-4 h-4 text-green-500`} /> : <TrendingDown className={`w-4 h-4text-red-500`} />}
                {earlyBirds && earlyBirds.difference >= 0 ? <p className="text-xs text-green-500">+{earlyBirds.difference} Increase than yesterday!</p> : <p className="text-xs text-red-500">{earlyBirds && earlyBirds.difference} Decrease than yesterday!</p>}
              </div>
            </div>
          </div>
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{earlyDepartures && earlyDepartures.today}</h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <Moon className="w-6 h-6 " />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">Early Departures</h2>
              <div className="flex items-center gap-2">
                {earlyDepartures && earlyDepartures.difference >= 0 ? <TrendingDown className={`w-4 h-4 text-green-500`} /> : <TrendingUp className={`w-4 h-4 text-red-500`} />}
                {earlyDepartures && earlyDepartures.difference >= 0 ? <p className="text-xs text-green-500">+{earlyDepartures.difference} Decrease than yesterday!</p> : <p className="text-xs text-red-500">{earlyDepartures && earlyDepartures.difference} Increase than yesterday!</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{absents && absents.today}</h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <Cloud className="w-6 h-6 " />
              </div>

            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">Absents</h2>
              <div className="flex items-center gap-2">
                {absents && absents.difference >= 0 ? <TrendingUp className={`w-4 h-4 text-red-500`} /> : <TrendingDown className={`w-4 h-4 text-green-500`} />}
                {absents && absents.difference >= 0 ? <p className="text-xs text-red-500">+{absents.difference} Increase than yesterday!</p> : <p className="text-xs text-green-500">{absents && absents.difference} Decrease than yesterday!</p>}
              </div>
            </div>
          </div>
          <div className="border-2 flex flex-col justify-between rounded-md w-full  h-[130px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{off?.length}</h2>
              <div className="p-1 border-2 rounded-full border-slate-200">
                <CalendarClock className="w-6 h-6 " />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-md">Day Off</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="p-5 mt-5 border-2 rounded-md md:w-full w-[clamp(250px,100%,500px)] ">
          <p className="mb-3 text-sm font-semibold text-slate-400" style={{ letterSpacing: '1px' }}>Attendance Comparison Chart</p>
          <Line
            data={data}
            options={options}
          />
        </div>
        <div className="p-5 mt-5 border-2 rounded-md md:w-full w-[clamp(250px,100%,500px)]">
          <p className="mb-3 text-sm font-semibold text-slate-400" style={{ letterSpacing: '1px' }}>Yearly Attendance</p>
          <Bar
            options={options}
            data={dataYearly}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard