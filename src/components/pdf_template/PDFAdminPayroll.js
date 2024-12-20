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
        <>
            <div className="payslip-container">
                {data.map((payslip, index) => {
                    const sssDeduction = payslip.total_pay * 0.095;
                    const philHealthDeduction = payslip.total_pay * 0.025;
                    const pagIbigDeduction = payslip.total_pay * 0.01;
                    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
                    const netPay = payslip.total_pay - totalDeductions;
                    console.log(payslip)

                    return (
                        <div key={index} className="payslip-page">
                            <div className="payslip-content">
                                {/* Header */}
                                <div className="payslip-header">
                                    <h1 className="payslip-title">Gasbee Payslip</h1>
                                </div>

                                {/* Employee Information */}
                                <div className="employee-info">
                                    <div>
                                        <div className="info-row">
                                            <span className="info-label">Employee Name: </span>
                                            <span>{payslip.name}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Hierarchy: </span>
                                            <span>{payslip.hierarchy}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Absent: </span>
                                            <span>{payslip.absent}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="info-row">
                                            <span className="info-label">Pay Period: </span>
                                            <span>{formatDate(payslip.period_start)} - {formatDate(payslip.period_end)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Pay Date: </span>
                                            <span>{formatDate(payslip.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Earnings and Deductions */}
                                <div className="earnings-deductions">
                                    {/* Earnings */}
                                    <div className="section">
                                        <h2 className="section-title">Earnings</h2>
                                        <table className="payslip-table">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Basic Salary</td>
                                                    <td className="amount">{formatCurrency(payslip.total_pay)}</td>
                                                </tr>
                                                <tr className="total-row">
                                                    <td>Gross Pay</td>
                                                    <td className="amount">{formatCurrency(payslip.total_pay)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Deductions */}
                                    <div className="section">
                                        <h2 className="section-title">Deductions</h2>
                                        <table className="payslip-table">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>SSS</td>
                                                    <td className="amount deduction">{formatCurrency(sssDeduction)}</td>
                                                </tr>
                                                <tr>
                                                    <td>PhilHealth</td>
                                                    <td className="amount deduction">{formatCurrency(philHealthDeduction)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Pag-IBIG</td>
                                                    <td className="amount deduction">{formatCurrency(pagIbigDeduction)}</td>
                                                </tr>
                                                <tr className="total-row">
                                                    <td>Total Deductions</td>
                                                    <td className="amount deduction">{formatCurrency(totalDeductions)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Net Pay */}
                                <div className="section">
                                    <h2 className="section-title">Net Pay</h2>
                                    <table className="payslip-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Total Earnings</td>
                                                <td className="amount">{formatCurrency(payslip.total_pay)}</td>
                                            </tr>
                                            <tr>
                                                <td>Total Deductions</td>
                                                <td className="amount deduction">{formatCurrency(totalDeductions)}</td>
                                            </tr>
                                            <tr className="total-row">
                                                <td>Net Pay</td>
                                                <td className="amount">{formatCurrency(netPay)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Note */}
                                <div className="note">
                                    Note: This is a computer-generated document and does not require a signature.
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Styles */}
            <style>
                {`
                    .payslip-container {
                        margin: 0;
                        font-family: sans-serif;
                        font-size: 0.75rem;
                        line-height: 1.25;
                        color: #2d3748;
                        background-color: #f7fafc;
                    }
                    .payslip-page {
                        padding: 1rem;
                        margin: 1rem auto;
                        background-color: white;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        page-break-after: always;
                    }
                    .payslip-content {
                        max-width: 48rem;
                        padding: 2rem;
                        margin: 0 auto;
                        background-color: white;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    .payslip-header {
                        margin-bottom: 2rem;
                        text-align: center;
                    }
                    .payslip-title {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #2b6cb0;
                    }
                    .employee-info {
                        display: flex;
                        justify-content: space-between;
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }
                    .info-row {
                        margin-bottom: 0.5rem;
                    }
                    .info-label {
                        font-weight: 600;
                    }
                    .earnings-deductions {
                        display: flex;
                        justify-content: space-between;
                        gap: 2rem;
                        margin-bottom: 2rem;
                    }
                    .section {
                        margin-bottom: 2rem;
                    }
                    .section-title {
                        font-size: 1.125rem;
                        font-weight: bold;
                        margin-bottom: 1rem;
                    }
                    .payslip-table {
                        width: 100%;
                    }
                    .payslip-table th {
                        padding: 0.5rem;
                        text-align: left;
                        background-color: #f7fafc;
                    }
                    .payslip-table td {
                        padding: 0.5rem;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .amount {
                        text-align: right;
                    }
                    .deduction {
                        color: #e53e3e;
                    }
                    .total-row {
                        font-weight: bold;
                    }
                    .note {
                        font-size: 0.875rem;
                        font-style: italic;
                        color: #718096;
                    }
                `}
            </style>
        </>
    );
};

export default PDFAdminPayroll;