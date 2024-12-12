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
            <div className="m-0 font-sans text-xs leading-tight text-gray-800 bg-gray-100"> {/* Reduced font size */}
                <div className="p-4 mx-auto bg-white rounded-lg shadow-md">
                    <h1 className="mb-2 text-xl font-bold text-center text-gray-900">Gasbee Payslips</h1> {/* Adjusted heading */}
                    <p className="mb-4 text-center text-gray-600">View and manage employee payslips for the current pay period.</p>
                    
                    <table className="w-full text-xs border-collapse"> {/* Reduced text size */}
                        <thead>
                            <tr className="text-white bg-gray-800">
                                <th className="px-1 py-2 text-left">Employee Name</th>
                                <th className="px-1 py-2 text-left">Pay Period</th>
                                <th className="px-1 py-2 text-right">Gross Pay</th>
                                <th className="px-1 py-2 text-right">SSS</th>
                                <th className="px-1 py-2 text-right">PhilHealth</th>
                                <th className="px-1 py-2 text-right">Pag-IBIG</th>
                                <th className="px-1 py-2 text-right">Total Deductions</th>
                                <th className="px-1 py-2 text-right">Net Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((payslip, index) => {
                                const sssDeduction = payslip.total_pay * 0.095;
                                const philHealthDeduction = payslip.total_pay * 0.025;
                                const pagIbigDeduction = payslip.total_pay * 0.01;
                                const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
                                const netPay = payslip.total_pay - totalDeductions;

                                return (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-1 py-1">{payslip.name}</td>
                                        <td className="px-1 py-1">{formatDate(payslip.period_start)}/{formatDate(payslip.period_end)}</td>
                                        <td className="px-1 py-1 text-right">{formatCurrency(payslip.total_pay)}</td>
                                        <td className="px-1 py-1 text-right text-red-600">{formatCurrency(sssDeduction)}</td>
                                        <td className="px-1 py-1 text-right text-red-600">{formatCurrency(philHealthDeduction)}</td>
                                        <td className="px-1 py-1 text-right text-red-600">{formatCurrency(pagIbigDeduction)}</td>
                                        <td className="px-1 py-1 text-right text-red-600">{formatCurrency(totalDeductions)}</td>
                                        <td className="px-1 py-1 font-bold text-right">{formatCurrency(netPay)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div className="mt-4 text-xs text-center text-gray-600">
                        <p>This is a computer-generated document and does not require a signature.</p>
                    </div>
                </div>
            </div>
        </Tailwind>
    );
};

export default PDFAdminPayroll;
