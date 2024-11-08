import * as React from "react";
import { Tailwind } from "@fileforge/react-print";
import { format, parseISO } from "date-fns";
import { PDFPayroll } from "./PDFPayroll";

export const PDFTemplate = ({ data, type }) => {
  const distributionCopy = data?.distribution_copy ? JSON.parse(data.distribution_copy) : {};

  if (type === "payroll") return <PDFPayroll data={data} />

  return (
    <Tailwind>
      <div className="max-w-4xl p-4 mx-auto bg-white border border-gray-300">
        <div className="p-2 mb-4 text-center bg-yellow-400">
          <h1 className="text-2xl font-bold">GASBEE PO!</h1>
          <p className="text-sm">BEE GAS GANDA! • PRESYONG BODEGA!</p>
        </div>
        <h2 className="py-2 mb-4 text-xl font-bold text-center text-white bg-black">APPLICATION FOR LEAVE FORM</h2>
        <form className="space-y-2">
          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[50%] p-1 border-r border-b border-gray-300">
              <label htmlFor="name" className="block text-xs font-bold">NAME:</label>
              <input type="text" id="name" className="w-full p-0 text-sm border-none" readOnly value={data?.name || ''} />
            </div>
            <div className="flex-1 min-w-[50%] p-1 border-b border-gray-300">
              <label htmlFor="date-filed" className="block text-xs font-bold">DATE FILED:</label>
              <input type="date" id="date-filed" className="w-full p-0 text-sm border-none" readOnly value={data?.created_at ? format(parseISO(data.created_at), 'yyyy-MM-dd') : ''} />
            </div>
            <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
              <label htmlFor="position" className="block text-xs font-bold">POSITION:</label>
              <input type="text" id="position" className="w-full p-0 text-sm border-none" readOnly value={data?.position || ''} />
            </div>
            <div className="flex-1 min-w-[50%] p-1">
              <label htmlFor="department" className="block text-xs font-bold">DEPARTMENT:</label>
              <input type="text" id="department" className="w-full p-0 text-sm border-none" readOnly value={data?.department || ''} />
            </div>
          </div>

          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label htmlFor="inclusive-dates" className="block text-xs font-bold">INCLUSIVE DATES</label>
              <input type="text" id="inclusive-dates" className="w-full p-0 text-sm border-none" readOnly value={format(parseISO(data.inclusive_dates), 'yyyy-MM-dd') || ''} />
            </div>
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label htmlFor="to-date" className="block text-xs font-bold">TO:</label>
              <input type="text" id="to-date" className="w-full p-0 text-sm border-none" readOnly value={format(parseISO(data.to_date), 'yyyy-MM-dd') || ''} />
            </div>
            <div className="flex-1 min-w-[33%] p-1">
              <label htmlFor="days-requested" className="block text-xs font-bold">No. of Days Requested:</label>
              <input type="number" id="days-requested" className="w-full p-0 text-sm border-none" readOnly value={data?.days_requested || ''} />
            </div>
          </div>

          <div className="p-1 border border-gray-300">
            <label htmlFor="reason" className="block text-xs font-bold">REASON:</label>
            <input type="text" id="reason" className="w-full p-0 text-sm border-none" readOnly value={data?.reason || ''} />
          </div>

          <div className="p-1 border border-gray-300">
            <label htmlFor="person-to-takeover" className="block text-xs font-bold">PERSON TO HAND OVER THE TASK:</label>
            <input type="text" id="person-to-takeover" className="w-full p-0 text-sm border-none" readOnly value={data?.person_to_takeover || ''} />
          </div>

          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label className="block text-xs font-bold">Requested by:</label>
              <input type="text" className="w-full p-0 text-sm border-none" value={data?.requested_by || ''} />
            </div>
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label className="block text-xs font-bold">Approved by:</label>
              <input type="text" className="w-full p-0 text-sm border-none" readOnly />
            </div>
            <div className="flex-1 min-w-[33%] p-1">
              <label className="block text-xs font-bold">Received by:</label>
              <input type="text" className="w-full p-0 text-sm border-none" readOnly />
            </div>
          </div>

          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label className="block text-xs font-bold">Date:</label>
              <input type="date" className="w-full p-0 text-sm border-none" value={data?.created_at ? format(parseISO(data.created_at), 'yyyy-MM-dd') : ''} />
            </div>
            <div className="flex-1 min-w-[33%] p-1 border-r border-gray-300">
              <label className="block mb-4 text-xs font-bold">DEPARTMENT HEAD</label>
              <label className="block text-xs font-bold">Date:</label>
              <input type="date" className="w-full p-0 text-sm border-none" readOnly />
            </div>
            <div className="flex-1 min-w-[33%] p-1">
              <label className="block mb-4 text-xs font-bold">HR DEPARTMENT</label>
              <label className="block text-xs font-bold">Date:</label>
              <input type="date" className="w-full p-0 text-sm border-none" readOnly />
            </div>
          </div>

          <div className="border border-gray-300">
            <div className="p-1 text-xs font-bold text-center text-white bg-black">FOR HRD&apos;S USE</div>
            <div className="flex flex-wrap p-2">
              <div className="flex-1 min-w-[50%]">
                <div className="mb-1 text-xs font-bold">TYPE OF LEAVE APPLIED FOR</div>
                {['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave', 'Solo Parent Act/Leave', 'Others:'].map((type) => (
                  <div key={type} className="flex items-center">
                    <input type="checkbox" id={type.replace(/\s+/g, '-').toLowerCase()} className="mr-1" checked={data?.leave_type?.toLowerCase() === type.toLowerCase()} />
                    <label htmlFor={type.replace(/\s+/g, '-').toLowerCase()} className="text-xs">{type}</label>
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-[50%]">
                <div className="flex items-center mb-1">
                  <input type="checkbox" id="with-pay" className="mr-1" checked={data?.leave_with_pay || false} />
                  <label htmlFor="with-pay" className="text-xs">With Pay</label>
                </div>
                <div className="flex items-center mb-1">
                  <input type="checkbox" id="without-pay" className="mr-1" checked={data?.leave_without_pay || false} />
                  <label htmlFor="without-pay" className="text-xs">Without Pay</label>
                </div>
                <div className="mt-2 mb-1 text-xs font-bold">DETAILS OF LEAVE MONITORING</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Available leave credits</span>
                    <input type="text" className="w-16 p-0 border border-gray-300" readOnly />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Less: Requested leave</span>
                    <input type="text" className="w-16 p-0 border border-gray-300" readOnly />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Balance</span>
                    <input type="text" className="w-16 p-0 border border-gray-300" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
              <label htmlFor="supporting-document" className="block text-xs font-bold">SUPPORTING DOCUMENT ATTACHMENT</label>
              <input type="text" id="supporting-document" placeholder="Please specify" className="w-full p-0 text-sm border-none" value={data?.supporting_document || ''} />
            </div>
            <div className="flex-1 min-w-[50%] p-1">
              <label className="block text-xs font-bold">Recorded by:</label>
              <input type="text" className="w-full p-0 text-sm border-none" readOnly />
            </div>
          </div>

          <div className="flex flex-wrap border border-gray-300">
            <div className="flex-1 min-w-[50%] p-1 border-r border-gray-300">
              <label className="block text-xs font-bold">Date:</label>
              <input type="date" className="w-full p-0 text-sm border-none" value={data?.created_at ? format(parseISO(data.created_at), 'yyyy-MM-dd') : ''} />
            </div>
            <div className="flex-1 min-w-[50%] p-1">
              <label className="block mb-4 text-xs font-bold">HRD</label>
              <label className="block text-xs font-bold">Date:</label>
              <input type="date" className="w-full p-0 text-sm border-none" readOnly />
            </div>
          </div>

          <div className="flex items-center justify-between p-1 space-x-4 border border-gray-300">
            <span className="text-xs font-bold">DISTRIBUTION COPY</span>
            <div className="flex items-center">
              <input type="checkbox" id="employee-copy" className="mr-1" checked={distributionCopy.employeeCopy || false} />
              <label htmlFor="employee-copy" className="text-xs">Employee</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="201-file" className="mr-1" checked={distributionCopy.file201 || false} />
              <label htmlFor="201-file" className="text-xs">201 file</label>
            </div>
          </div>
        </form>
      </div>
    </Tailwind>
  );
};