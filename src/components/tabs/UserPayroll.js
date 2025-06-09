import useAuth from '@/hooks/useAuth';
import { getUserPayroll } from '@/lib/api';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, LinkIcon, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import generate from '../pdf_template/generatePDF';
import { toast } from 'sonner';

function UserPayroll() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [filterData, setFilteredData] = useState(null);
    const [loadingItems, setLoadingItems] = useState({}); // Track loading state for each item
    const [links, setLinks] = useState({}); // Track link state for each item

    const limit = 5;

    useEffect(() => {
        const fetch = async () => {
            const id = user?.user_id;
            console.log(id);
            try {
                axios.defaults.withCredentials = true;
                const res = await getUserPayroll(page, limit, id);
                if (res.status === 200) {
                    console.log(res.data);
                    setData(res.data.data);
                    setFilteredData(res.data);
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetch();
    }, [user, page]);

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleGenerate = async (item) => {
        setLoadingItems(prev => ({ ...prev, [item.id]: true }));
        console.log(item);
        try {
            const link = await generate({ type: "payroll", data: item });
            if (link) {
                window.open(link, '_blank');
                toast("Success", {
                    description: `PDF Generated Successfully!`,
                });
                setLinks(prev => ({ ...prev, [item.id]: link }));
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingItems(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const downloadPDF = (link) => {
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.download = 'payroll.pdf';
        anchor.target = '_blank';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };


    return (
        <div className="max-w-[1000px] m-auto flex flex-col gap-5">
            {data.length > 0 ? data.map(item => {
                // Calculate deductions
                const sssDeduction = item.total_pay * (item?.sss_rate ?? 0);
                const philHealthDeduction = item.total_pay * (item?.philhealth_rate ?? 0);
                const pagIbigDeduction = item.total_pay * (item?.pagibig_rate ?? 0);
                const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + item.lateDeduction + item.undertimeDeduction;

                // Calculate net pay
                const netPayRaw = item.total_pay - totalDeductions;
                const netPay = netPayRaw < 0 ? 0 : netPayRaw;

                return (
                    <Card key={item.id} className="w-full ">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                            <CardTitle className="text-xl font-bold">Payslip</CardTitle>
                            <div className="flex space-x-2">
                                <Button disabled variant="outline" size='sm'>
                                    Paid
                                </Button>
                                <Button
                                    disabled={loadingItems[item.id]}
                                    size='sm'
                                    onClick={() => handleGenerate(item)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loadingItems[item.id] ? <LoaderCircle className="animate-spin" /> : 'Generate Payslip'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-[clamp(12px, 18px, 5vw)] ">
                                        <Clock size={16} />
                                        <span>Hours worked: </span>
                                        <span >{item.hours_worked} Hour/s</span>
                                    </div>
                                    <div className="flex items-center text-[clamp(12px, 18px, 5vw)] space-x-2 ">
                                        <span>Amount: </span>
                                        <span >{formatCurrency(netPay)}</span>
                                    </div>
                                </div>
                                <div className="text-sm sm:text-[clamp(12px, 18px, 5vw)] ">
                                    Period:  {`${format(new Date(item.period_start), 'MMMM d')} - ${format(new Date(item.period_end), 'd, yyyy')}`}
                                </div>
                            </div>

                            {links[item.id] && <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm ">
                                    <LinkIcon size={16} />
                                    <span>Payroll Link:</span>
                                </div>
                                <Input
                                    value={links[item.id]}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button onClick={() => downloadPDF(links[item.id])} className="bg-blue-600 hover:bg-blue-700">
                                    Download
                                </Button>
                            </div>}
                        </CardContent>
                    </Card>
                )
            }

            ) : <Card className="rounded-xl">
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
                    {filterData.totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>}
                </div>}
            </div>}
        </div>
    );
}

export default UserPayroll;