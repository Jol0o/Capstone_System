// utils/pdfUtils.js
import React from "react";
import { PDFTemplate } from "./PDFTemplate";
import PDFAdminPayroll from "./PDFAdminPayroll";
import { PDFPayroll } from './PDFPayroll';
import { renderToStaticMarkup } from "react-dom/server";

const PDF_CO_API_KEY = 'jloyd9836@gmail.com_H6gMVZnZlHNA826JpojHyrh3Y3Y2UuECOKF04fOsUnd9u1fkVcRz7sqD3hajZwHL'; // Ensure the environment variable is correctly named

const generatePDF = async ({ data, type = "request" }) => {
    let htmlContent;

    if (type === "admin") {
        htmlContent = renderToStaticMarkup(<PDFAdminPayroll data={data} />);
    } else if (type === "payroll") {
        htmlContent = renderToStaticMarkup(<PDFPayroll data={data} />);
    } else {
        htmlContent = renderToStaticMarkup(<PDFTemplate data={data} type={type} />);
    }

    const fullHtmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PDF Document</title>
            <link rel="stylesheet" href="../../app/style.css">
            <style>
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
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                }
                .payslip-content {
                    padding: 1rem;
                }
                .payslip-header {
                    text-align: center;
                    margin-bottom: 1rem;
                }
                .payslip-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #3182ce;
                }
                .employee-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .info-row {
                    margin-bottom: 0.5rem;
                }
                .info-label {
                    font-weight: bold;
                }
                .earnings-deductions {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .section {
                    width: 48%;
                }
                .section-title {
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                .payslip-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .payslip-table th,
                .payslip-table td {
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
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
                    text-align: center;
                    margin-top: 1rem;
                }
                .form-container {
  @apply max-w-4xl mx-auto bg-white border border-gray-300;
}

.header {
  @apply p-4 text-center bg-yellow-400;
}

.header-logo {
  @apply h-12 mx-auto mb-1;
}

.header-subtitle {
  @apply text-sm;
}

.form-title {
  @apply py-2 text-xl font-bold text-center text-white bg-black;
}

.form-content {
  @apply p-4;
}

.grid-2-cols {
  @apply grid grid-cols-2 gap-0 border border-gray-300;
}

.grid-3-cols {
  @apply grid grid-cols-3 mt-4 border border-gray-300;
}

.form-cell {
  @apply p-2;
}

.form-cell-border-r {
  @apply p-2 border-r border-gray-300;
}

.form-cell-border-b {
  @apply p-2 border-b border-gray-300;
}

.form-cell-border-rb {
  @apply p-2 border-r border-b border-gray-300;
}

.form-label {
  @apply block text-xs font-bold;
}

.form-input {
  @apply w-full p-1 text-sm border-none;
}

.form-section {
  @apply mt-4 border border-gray-300;
}

.form-section-title {
  @apply py-1 text-sm font-bold text-center text-white bg-black;
}

.checkbox-container {
  @apply flex items-center mb-1;
}

.checkbox {
  @apply mr-1;
}

.checkbox-label {
  @apply text-xs;
}

.leave-details {
  @apply space-y-2;
}

.leave-details-row {
  @apply flex justify-between;
}

.leave-details-input {
  @apply w-16 text-xs border border-gray-300;
}

.distribution-copy {
  @apply flex items-center justify-between p-2 mt-4 border border-gray-300;
}

.distribution-options {
  @apply flex items-center space-x-4;
}

.text-center-section {
  @apply mt-4 text-center;
}

.mt-2 {
  @apply mt-2;
}

.mb-2 {
  @apply mb-2;
}

.mt-4 {
  @apply mt-4;
}



}
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    try {
        // Base64 encode the HTML content
        const base64Content = Buffer.from(fullHtmlContent).toString("base64");

        // Upload HTML to PDF.co
        const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload/base64', {
            method: "POST",
            headers: {
                "x-api-key": PDF_CO_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file: base64Content,  // Use the correct parameter "file"
            }),
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.error) throw new Error(uploadResult.message);

        // Now send the HTML content directly for conversion
        const convertResponse = await fetch("https://api.pdf.co/v1/pdf/convert/from/html", {
            method: "POST",
            headers: {
                "x-api-key": PDF_CO_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                html: fullHtmlContent,  // Use the "html" parameter directly
                name: type === "payroll" || type === "admin" ? "GeneratedPayroll.pdf" : "LeaveForm.pdf",
            }),
        });

        const convertResult = await convertResponse.json();
        if (convertResult.error) throw new Error(convertResult.message);

        // Return the URL of the generated PDF
        return convertResult.url;
    } catch (error) {
        console.error("PDF.co Error:", error);
        throw error;
    }
};



export default generatePDF;