import React from 'react';
import { Tailwind } from "@fileforge/react-print";

const PDFAdminPayroll = ({ data }) => {

    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    return (
        <Tailwind>
            <div className="m-0 font-sans text-xs leading-tight text-gray-800 bg-gray-100">
                {data.map((payslip, index) => {
                    const sssDeduction = payslip.total_pay * 0.095;
                    const philHealthDeduction = payslip.total_pay * 0.025;
                    const pagIbigDeduction = payslip.total_pay * 0.01;
                    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
                    const netPay = payslip.total_pay - totalDeductions;

                    return (
                        <div key={index} className="p-4 mx-auto my-4 bg-white rounded-lg shadow-md page-break">
                            <div className="max-w-3xl p-8 mx-auto bg-white rounded-lg shadow">
                                {/* Header */}
                                <div className="mb-8 text-center">
                                    <h1 className="text-2xl font-bold text-blue-600">Gasbee Payslip</h1>
                                </div>

                                {/* Employee Information */}
                                <div className="flex justify-between gap-4 mb-8">
                                    <div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Employee Name: </span>
                                            <span>{payslip.name}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Hierarchy: </span>
                                            <span>{payslip.name}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Absent: </span>
                                            <span>{payslip.absent}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Pay Period: </span>
                                            <span>{formatDate(payslip.period_start)} - {formatDate(payslip.period_end)}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Pay Date: </span>
                                            <span>{formatDate(payslip.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Earnings and Deductions */}
                                <div className="flex justify-between gap-8 mb-8">
                                    {/* Earnings */}
                                    <div>
                                        <h2 className="mb-4 text-lg font-bold">Earnings</h2>
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-2 text-left">Description</th>
                                                    <th className="p-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-2">Basic Salary</td>
                                                    <td className="p-2 text-right">{formatCurrency(payslip.total_pay)}</td>
                                                </tr>
                                                <tr className="font-bold">
                                                    <td className="p-2">Gross Pay</td>
                                                    <td className="p-2 text-right">{formatCurrency(payslip.total_pay)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <h2 className="mb-4 text-lg font-bold">Deductions</h2>
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-2 text-left">Description</th>
                                                    <th className="p-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-2">SSS</td>
                                                    <td className="p-2 text-right text-red-500">{formatCurrency(sssDeduction)}</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">PhilHealth</td>
                                                    <td className="p-2 text-right text-red-500">{formatCurrency(philHealthDeduction)}</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-2">Pag-IBIG</td>
                                                    <td className="p-2 text-right text-red-500">{formatCurrency(pagIbigDeduction)}</td>
                                                </tr>
                                                <tr className="font-bold">
                                                    <td className="p-2">Total Deductions</td>
                                                    <td className="p-2 text-right text-red-500">{formatCurrency(totalDeductions)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Net Pay */}
                                <div className="mb-8">
                                    <h2 className="mb-4 text-lg font-bold">Net Pay</h2>
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left">Description</th>
                                                <th className="p-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="p-2">Total Earnings</td>
                                                <td className="p-2 text-right">{formatCurrency(payslip.total_pay)}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="p-2">Total Deductions</td>
                                                <td className="p-2 text-right text-red-500">{formatCurrency(totalDeductions)}</td>
                                            </tr>
                                            <tr className="font-bold">
                                                <td className="p-2">Net Pay</td>
                                                <td className="p-2 text-right">{formatCurrency(netPay)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Note */}
                                <div className="text-sm italic text-gray-600">
                                    Note: This is a computer-generated document and does not require a signature.
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add global CSS for page breaks */}
            <style>
                {`
                    .page-break {
                        page-break-after: always;
                    }
                `}
            </style>
        </Tailwind>
    );
};

export default PDFAdminPayroll;