import React from 'react';
import { formatCurrency , numberToWords } from "@/lib/util";
import { format } from "date-fns";


const PDFAdminPayroll = ({ data }) => {
    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    return (
        <>
            <div className="payslip-container">
                {data.map((payslip, index) => {
                    const sssDeduction = payslip.total_pay * 0.095;
                    const philHealthDeduction = payslip.total_pay * 0.025;
                    const pagIbigDeduction = payslip.total_pay * 0.01;
                    const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;
                    const netPay = payslip.total_pay - totalDeductions;

                    return (
                       <div key={index} className="payslip-card">
        <div className="payslip-header">
          <h1 className="header-title">Payslip</h1>
          <h2 className="company-name">Gasbee</h2>
        </div>

        <div className="employee-details">
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Employee name</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{payslip?.name}</span>
            </div>
          </div>
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Pay Period</span>
              <span className="detail-separator">:</span>
              <span className="detail-value"> {format(new Date(data.period_start), "PPP")}/ {format(new Date(data.period_end), "PPP")}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hierarchy</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{payslip?.hierarchy}</span>
            </div>
          </div>
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Worked Days</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{payslip?.days_present}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{payslip?.department}</span>
            </div>
          </div>
        </div>

        <table className="payslip-table">
          <thead>
            <tr>
              <th className="table-header left">Earnings</th>
              <th className="table-header right">Amount</th>
              <th className="table-header left with-padding">Deductions</th>
              <th className="table-header right">Amount</th>
            </tr>
          </thead>
         <tbody>
            <tr>
              <td className="with-padding">Basic Salary</td>
              <td className="amount">{formatCurrency(payslip.total_pay)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="with-padding">Pag-IBIG</td>
              <td className="amount deduction">{formatCurrency(pagIbigDeduction)}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="with-padding">SSS</td>
              <td className="amount deduction">{formatCurrency(sssDeduction)}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="with-padding">PhilHealth</td>
              <td className="amount deduction">{formatCurrency(philHealthDeduction)}</td>
            </tr>
            <tr className="total-row">
              <td>Gross Pay</td>
              <td className="amount">{formatCurrency(payslip.total_pay)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="with-padding">Total Deductions</td>
              <td className="amount deduction">{formatCurrency(totalDeductions)}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="with-padding">Net Pay</td>
              <td className="amount">{formatCurrency(netPay)}</td>
            </tr>
          </tbody>
        </table>

        <div className="net-amount">
          <p className="amount-number">{formatCurrency(netPay)}</p>
          <p className="amount-words">{numberToWords(netPay)}</p>
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
                    }
                    .payslip-page {
                        padding: 1rem;
                        margin: 1rem auto;
            
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        page-break-after: always;
                    }
               .payslip-card {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  page-break-after: always;
}

          .payslip-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .header-title {
            font-size: 1.5rem;
            font-weight: normal;
            margin-bottom: 0.5rem;
          }

          .company-name {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }

          .company-address {
            font-size: 0.875rem;
            margin: 0;
          }

          .employee-details {
            margin-bottom: 2rem;
          }

          .details-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            margin-bottom: 0.5rem;
          }

          .detail-item {
            display: flex;
          }

          .detail-label {
            width: 8rem;
            font-weight: bold
          }

          .detail-separator {
            margin: 0 0.5rem;
          }

          .payslip-table {
            width: 100%;
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            margin-bottom: 2rem;
            border-collapse: collapse;
          }

          .table-header {
            padding: 0.5rem 0;
            border-bottom: 1px solid black;
            font-weight: bold;
          }

          .left {
            text-align: left;
          }

          .right {
            text-align: right;
          }

          .with-padding {
            padding: 0.5rem;
          }

          .amount {
            text-align: right;
          }

          .payslip-table td {
            padding: 0.25rem 0;
          }

          .total-row {
            border-top: 1px solid black;
            font-weight: 500;
          }

          .net-amount {
            text-align: center;
            margin-bottom: 4rem;
          }

          .amount-number {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
          }

          .amount-words {
            margin: 0;
          }

          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
          }

          .signature-box {
            width: 16rem;
          }

          .signature-line {
            border-top: 1px solid black;
            padding-top: 0.5rem;
          }

          .signature-text {
            text-align: center;
            margin: 0;
          }

          .footer {
            text-align: center;
            margin-top: 2rem;
          }

          .deduction{
          color: red
          }
                `}
            </style>
        </>
    );
};

export default PDFAdminPayroll;