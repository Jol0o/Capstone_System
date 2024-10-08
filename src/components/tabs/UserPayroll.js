import useAuth from '@/hooks/useAuth';
import { getUserPayroll } from '@/lib/api';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, MoreHorizontal, User, FileDown, ListFilter, ChevronLeft, ChevronRight } from "lucide-react";

function UserPayroll() {
    const { user } = useAuth()
    const [page, setPage] = useState(1)
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState(null)

    const limit = 5

    useEffect(() => {

        const fetch = async () => {

            const id = user?.user_id
            console.log(id)
            try {
                axios.defaults.withCredentials = true;
                const res = await getUserPayroll(page, limit, id)
                if (res.status === 200) {
                    console.log(res.data)
                    setData(res.data.data)
                    setFilteredData(res.data)
                }
            } catch (e) {
                console.log(e)
            }
        }
        fetch()
    }, [user, page])

        const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="max-w-[1000px] m-auto flex flex-col gap-5">
            {data && data.map(item => (
                <Card className="rounded-xl" key={item.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between capitalize text-md">
                            Payroll
                            <Badge>Paid</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <CardDescription className="flex items-center justify-between">
                            <div>
                                <p>Hours worked: {item.hours_worked}</p>
                                <p>Amount: {item.total_pay}</p>
                            </div>
                            <p>Sent Date: {format(new Date(item.created_at), "PPP")}</p>
                        </CardDescription>
                    </CardContent>
                </Card>
            ))}
            {data.length > 0 ? <div className="flex items-center justify-end py-4 space-x-2">
                {filterData.total > limit && <div className="flex items-center gap-2">
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>}
            </div> : <div className="flex items-center justify-center h-40">
            <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">No Available Data</p>
            </div>}
        </div>
    )
}

export default UserPayroll