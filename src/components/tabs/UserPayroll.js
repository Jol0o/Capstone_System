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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, MoreHorizontal, User, Clock, FileDown, LinkIcon, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import generate from '../pdf_template/generatePDF';
import Link from 'next/link';
import { toast } from 'sonner';

function UserPayroll() {
    const { user } = useAuth()
    const [page, setPage] = useState(1)
    const [data, setData] = useState([])
    const [filterData, setFilteredData] = useState(null)
    const [loadGenerate, setLoadGenerate] = useState(false)
    const [link, setLink] = useState('')

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

    const handleGenerate = async (data) => {
        setLoadGenerate(true);
        console.log(data)
        try {
            const link = await generate({ type: "payroll", data });
            if (link) {
                window.open(link, '_blank');
                setLoadGenerate(false);
                toast("Success", {
                    description: `PDF Generated Successfully!`,
                });
                setLink(link);
            }
        } catch (e) {
            console.log(e);
            setLoadGenerate(false);
        }
    };

    const downloadPDF = (link) => {
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.download = 'payroll.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };


    return (
        <div className="max-w-[1000px] m-auto flex flex-col gap-5">
            {data.length > 0 ? data.map(item => (
                <Card key={item.id} className="w-full text-white bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-xl font-bold">Payroll</CardTitle>
                        <div className="flex space-x-2">
                            <Button disabled variant="outline" className="text-white bg-gray-800 border-gray-700 hover:bg-gray-700">
                                Paid
                            </Button>
                            <Button disabled={loadGenerate} onClick={() => handleGenerate(item)} className="bg-blue-600 hover:bg-blue-700">
                                {loadGenerate ? <LoaderCircle className="animate-spin" /> : 'Generate'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-gray-400">
                                    <Clock size={16} />
                                    <span>Hours worked: {item.hours_worked} </span>
                                    <span className="text-white">0</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-400">
                                    <span>Amount: </span>
                                    <span className="text-white">{item.total_pay}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-400">
                                Sent Date: {format(new Date(item.created_at), "PPP")}
                            </div>
                        </div>

                        {link && <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <LinkIcon size={16} />
                                <span>Payroll Link:</span>
                            </div>
                            <Input
                                value={link}
                                readOnly
                                className="font-mono text-sm text-gray-300 bg-gray-800 border-gray-700"
                            />
                        </div>}
                    </CardContent>
                </Card>
            )) : <Card className="rounded-xl">
                <CardContent className="flex flex-col text-xl font-semibold ite">
                    <CardDescription className="flex items-center justify-center">
                        No Available Data
                    </CardDescription>
                </CardContent>
            </Card>}
            {data.length > 0 && <div className="flex items-center justify-end py-4 space-x-2">
                {filterData.total > limit && <div className="flex items-center gap-2">
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>}
            </div>}
        </div>
    )
}

export default UserPayroll