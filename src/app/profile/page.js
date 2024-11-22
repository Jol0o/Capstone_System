'use client'
import { AdminProfile } from '@/components/tabs/AdminProfile';
import useAuth from '@/hooks/useAuth';
import React from 'react'

function Page() {
    // const { auth, user } = useAuth();

    // if (!auth) return <div>Loading...</div>;
    return (
        <AdminProfile />
    )
}

export default Page