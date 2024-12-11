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


        fetchEarlyBirds();
        fetchLates()
        fetchEarlyDepartures()
        fetchAbsents()
        fetchOff()
        fetchEmployees()
    }, []);


    return { earlyBirds, lates, earlyDepartures, absents, off, employee }
}

export default useAnalytics