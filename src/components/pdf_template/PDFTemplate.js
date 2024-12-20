import * as React from "react";
import { format, parseISO } from "date-fns";


export const PDFTemplate = ({ data, type }) => {
  const distributionCopy = data?.distribution_copy ? JSON.parse(data.distribution_copy) : {};

  return (
    <div className="form-container">
      <div className="header">
        <img 
          src="/placeholder.svg?height=50&width=200" 
          alt="GASBEE PO! Logo with Bee" 
          className="header-logo"
        />
        <p className="header-subtitle">BEE GAS GANDA! • PRESYONG BODEGA!</p>
      </div>
      
      <h1 className="form-title">
        APPLICATION FOR LEAVE FORM
      </h1>
      
      <div className="form-content">
        <div className="grid-2-cols">
          <div className="form-cell-border-rb">
            <label className="form-label">NAME:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.name || ''}
            />
          </div>
          <div className="form-cell-border-b">
            <label className="form-label">DATE FILED:</label>
            <input 
              type="date"
              className="form-input"
              readOnly
              value={data?.created_at ? format(parseISO(data.created_at), 'yyyy-MM-dd') : ''}
            />
          </div>
          <div className="form-cell-border-r">
            <label className="form-label">POSITION:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.position || ''}
            />
          </div>
          <div className="form-cell">
            <label className="form-label">DEPARTMENT:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.department || ''}
            />
          </div>
        </div>

        <div className="grid-3-cols">
          <div className="form-cell-border-r">
            <label className="form-label">INCLUSIVE DATES:</label>
            <input 
              type="date"
              className="form-input"
              readOnly
              value={data?.inclusive_dates ? format(parseISO(data.inclusive_dates), 'yyyy-MM-dd') : ''}
            />
          </div>
          <div className="form-cell-border-r">
            <label className="form-label">TO:</label>
            <input 
              type="date"
              className="form-input"
              readOnly
              value={data?.to_date ? format(parseISO(data.to_date), 'yyyy-MM-dd') : ''}
            />
          </div>
          <div className="form-cell">
            <label className="form-label">No. of Days Requested:</label>
            <input 
              type="number"
              className="form-input"
              readOnly
              value={data?.days_requested || ''}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-cell">
            <label className="form-label">REASON:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.reason || ''}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-cell">
            <label className="form-label">PERSON TO HAND OVER THE TASK:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.person_to_takeover || ''}
            />
          </div>
        </div>

        <div className="grid-3-cols">
          <div className="form-cell-border-r">
            <label className="form-label">Requested by:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.requested_by || ''}
            />
            <label className="mt-4 form-label">Date:</label>
            <input 
              type="date"
              className="form-input"
              readOnly
              value={data?.created_at ? format(parseISO(data.created_at), 'yyyy-MM-dd') : ''}
            />
          </div>
          <div className="form-cell-border-r">
            <label className="form-label">Approved by:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.approved_by || ''}
            />
            <div className="text-center-section">
              <p className="form-label">DEPARTMENT HEAD</p>
              <label className="mt-2 form-label">Date:</label>
              <input 
                type="date"
                className="form-input"
                readOnly
                value={data?.date_of_approve ? format(parseISO(data.date_of_approve), 'yyyy-MM-dd') : ''}
              />
            </div>
          </div>
          <div className="form-cell">
            <label className="form-label">Received by:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.received_by || ''}
            />
            <div className="text-center-section">
              <p className="form-label">HR DEPARTMENT</p>
              <label className="mt-2 form-label">Date:</label>
              <input 
                type="date"
                className="form-input"
                readOnly
                value={data?.date_of_received ? format(parseISO(data.date_of_received), 'yyyy-MM-dd') : ''}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            FOR HRD'S USE
          </div>
          <div className="grid-2-cols">
            <div className="form-cell-border-r">
              <p className="mb-2 form-label">TYPE OF LEAVE APPLIED FOR</p>
              {[
                'Vacation Leave',
                'Sick Leave',
                'Emergency Leave',
                'Maternity Leave',
                'Paternity Leave',
                'Solo Parent Act/Leave',
                'Others:'
              ].map((type) => (
                <div key={type} className="checkbox-container">
                  <input
                    type="checkbox"
                    id={type.replace(/\s+/g, '-').toLowerCase()}
                    className="checkbox"
                    checked={data?.leave_type?.toLowerCase() === type.toLowerCase()}
                    readOnly
                  />
                  <label htmlFor={type.replace(/\s+/g, '-').toLowerCase()} className="checkbox-label">
                    {type}
                  </label>
                </div>
              ))}
            </div>
            <div className="form-cell">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="with-pay"
                  className="checkbox"
                  checked={data?.withpay || false}
                  readOnly
                />
                <label htmlFor="with-pay" className="checkbox-label">With Pay</label>
              </div>
              <div className="mb-2 checkbox-container">
                <input
                  type="checkbox"
                  id="without-pay"
                  className="checkbox"
                  checked={!data?.withpay}
                  readOnly
                />
                <label htmlFor="without-pay" className="checkbox-label">Without Pay</label>
              </div>
              <div className="leave-details">
                <p className="form-label">DETAILS OF LEAVE MONITORING</p>
                <div className="leave-details-row">
                  <span className="checkbox-label">Available leave credits</span>
                  <input type="text" className="leave-details-input" readOnly />
                </div>
                <div className="leave-details-row">
                  <span className="checkbox-label">Less: Requested leave</span>
                  <input type="text" className="leave-details-input" readOnly />
                </div>
                <div className="leave-details-row">
                  <span className="checkbox-label">Balance</span>
                  <input type="text" className="leave-details-input" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2-cols">
          <div className="form-cell-border-r">
            <label className="form-label">SUPPORTING DOCUMENT ATTACHMENT</label>
            <input 
              type="text"
              className="form-input"
              placeholder="Please specify"
              readOnly
              value={data?.supporting_document || ''}
            />
          </div>
          <div className="form-cell">
            <label className="form-label">Recorded by:</label>
            <input 
              type="text"
              className="form-input"
              readOnly
              value={data?.recorded_by || ''}
            />
            <div className="text-center-section">
              <p className="form-label">HRD</p>
              <label className="mt-2 form-label">Date:</label>
              <input 
                type="date"
                className="form-input"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="distribution-copy">
          <span className="form-label">DISTRIBUTION COPY</span>
          <div className="distribution-options">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="employee-copy"
                className="checkbox"
                checked={distributionCopy.employeeCopy || false}
                readOnly
              />
              <label htmlFor="employee-copy" className="checkbox-label">Employee</label>
            </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="201-file"
                className="checkbox"
                checked={distributionCopy.file201 || false}
                readOnly
              />
              <label htmlFor="201-file" className="checkbox-label">201 file</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

