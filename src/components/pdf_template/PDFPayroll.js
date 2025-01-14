import * as React from "react";
import { format } from "date-fns";
import { formatCurrency, numberToWords } from "@/lib/util";

export const PDFPayroll = ({ data }) => {
  const { total_pay } = data;

  // Calculate deductions
  const sssDeduction = total_pay * 0.095;
  const philHealthDeduction = total_pay * 0.025;
  const pagIbigDeduction = total_pay * 0.01;
  const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;

  // Calculate net pay
  const netPay = total_pay - totalDeductions;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="payslip-container">
        <div className="payslip-header">
          <h1 className="header-title">Payslip</h1>
          <h2 className="company-name">Gasbee</h2>
        </div>

        <div className="employee-details">
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Employee name</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{data?.name}</span>
            </div>
              <div className="detail-item">
              <span className="detail-label">Hierarchy</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{data?.hierarchy}</span>
            </div>
          </div>
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Pay Period</span>
              <span className="detail-separator">:</span>
              <span className="detail-value"> {`${format(new Date(data.period_start), 'MMMM d')} - ${format(new Date(data.period_end), 'd, yyyy')}`}</span>
            </div>
          </div>
          <div className="details-row">
            <div className="detail-item">
              <span className="detail-label">Days Worked</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{data?.days_present}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-separator">:</span>
              <span className="detail-value">{data?.department}</span>
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
              <td className="amount">{formatCurrency(total_pay)}</td>
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
              <td className="amount">{formatCurrency(total_pay)}</td>
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

      <style>
        {`
          .payslip-container {
            max-width: 48rem;
            margin: 0 auto;
            padding: 2rem;
            background-color: white;
            font-family: system-ui, -apple-system, sans-serif;
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
            font-weight: 700;
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
            padding: 0.5rem 0;
          }

          .amount {
            text-align: right;
            padding: 0.5rem 0;
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

           .detail-value {
          text-wrap: nowrap;
          }
        `}
      </style>
    </>
  );
};

