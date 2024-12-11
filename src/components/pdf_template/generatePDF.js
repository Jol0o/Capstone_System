'use server'
import React from "react";
import PDFTemplate from "./PDFTemplate"; // Assuming PDFTemplate is a default export
import PDFAdminPayroll from "./PDFAdminPayroll"; // Assuming PDFAdminPayroll is a default export
import { Onedoc } from "@onedoc/client";
import { compile } from "@onedoc/react-print";

const ONEDOC_API_KEY = process.env.ONE_DOC; // replace with your api key

const generate = async ({ data, type = 'request' }) => {
    const onedoc = new Onedoc(ONEDOC_API_KEY);

    let doc = {
        html: await compile(type === 'admin' ? <PDFAdminPayroll data={data} /> : <PDFTemplate data={data} type={type} />),
        title: "Gasbee",
        test: true, // if true, produce a PDF in test mode with a Onedoc's watermark
        save: true, // if true, host the document and provide a download link in the console and your Onedoc's dashboard
        expiresIn: 7, // the number of days you want to host your document
    };

    const { file, link, error, info } = await onedoc.render(doc);

    if (error) {
        throw error;
    }

    return link;
}

export default generate;