'use client'
import React, { useEffect, useState } from 'react'
import useAuth from './useAuth';
import axios from 'axios';
import { getEarlyBirds, getLateEmployees, getEarlyDepartures, getAbsents, getYearlyAttendance, getMonthlyAttendance, getMonthlyEmployees, getOff } from '@/lib/api';

function useAnalytics() {
    const [earlyBirds, setEarlyBirds] = useState(null)
    const [lates, setLates] = useState(null)
    const [earlyDepartures, setEarlyDepartures] = useState(null)
    const [absents, setAbsents] = useState(null)
    const [off, setOff] = useState(null)
    const [employee, setEmployee] = useState(null)
    const [monthly, setMonthly] = useState(null)
    const [yearly, setYearly] = useState(null)

    useEffect(() => {

        const fetchEarlyBirds = async () => {
            const response = await getEarlyBirds()
            setEarlyBirds(response.data.data)
        };

        const fetchLates = async () => {
            const response = await getLateEmployees()
            setLates(response.data.data)
        };

        const fetchEarlyDepartures = async () => {
            const response = await getEarlyDepartures()
            setEarlyDepartures(response.data.data)
        };

        const fetchAbsents = async () => {
            const response = await getAbsents()
            setAbsents(response.data.data)
        };

        const fetchOff = async () => {
            const response = await await getOff()
            setOff(response.data.data)
        };

        const fetchEmployees = async () => {
            const response = await getMonthlyEmployees()
            setEmployee(response.data.data)
        };

        const fetchMonthly = async () => {
            const response = await getMonthlyAttendance()
            setMonthly(response.data.data)
        };

        const fetchYearly = async () => {
            const response = await getYearlyAttendance()
            setYearly(response.data.data)
        };


        fetchEarlyBirds();
        fetchLates()
        fetchEarlyDepartures()
        fetchAbsents()
        fetchOff()
        fetchEmployees()
        fetchMonthly()
        fetchYearly()
    }, []);


    return { earlyBirds, lates, earlyDepartures, absents, off, employee, monthly, yearly }
}

export default useAnalytics