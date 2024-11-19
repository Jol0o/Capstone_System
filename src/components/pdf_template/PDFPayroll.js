import * as React from "react";
import { Tailwind } from "@fileforge/react-print";
import { format, parseISO } from "date-fns";

export const PDFPayroll = ({ data }) => {
  const { total_pay } = data;

  // Calculate deductions
  const sssDeduction = total_pay * 0.095;
  const philHealthDeduction = total_pay * 0.025;
  const pagIbigDeduction = total_pay * 0.01;
  const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction;

  // Calculate net pay
  const netPay = total_pay - totalDeductions;

  return (
    <Tailwind>
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
              <span>{data.name}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Employee ID: </span>
              <span>{data.employee_id}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Department: </span>
              <span>Sales</span>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Pay Period: </span>
              <span>May 1, 2024 - May 15, 2024</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Pay Date: </span>
              <span>May 20, 2024</span>
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
                  <td className="p-2 text-right">₱{total_pay.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2">Gross Pay</td>
                  <td className="p-2 text-right">₱{total_pay.toFixed(2)}</td>
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
                  <td className="p-2 text-right text-red-500">₱{sssDeduction.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">PhilHealth</td>
                  <td className="p-2 text-right text-red-500">₱{philHealthDeduction.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Pag-IBIG</td>
                  <td className="p-2 text-right text-red-500">₱{pagIbigDeduction.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2">Total Deductions</td>
                  <td className="p-2 text-right text-red-500">₱{totalDeductions.toFixed(2)}</td>
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
                <td className="p-2 text-right">₱{total_pay.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Total Deductions</td>
                <td className="p-2 text-right text-red-500">₱{totalDeductions.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td className="p-2">Net Pay</td>
                <td className="p-2 text-right">₱{netPay.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="text-sm italic text-gray-600">
          Note: This is a computer-generated document and does not require a signature.
        </div>
      </div>
    </Tailwind>
  );
};