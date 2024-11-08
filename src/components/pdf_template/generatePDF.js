'use server'
import React from "react";
import { PDFTemplate } from "./PDFTemplate";
import { Onedoc } from "@onedoc/client";
import { readFileSync, writeFileSync } from "fs";
import { compile } from "@onedoc/react-print";
import { join } from "path";

const ONEDOC_API_KEY = process.env.ONE_DOC; // replace with your api key

const generate = async ({ data, type = 'request' }) => {
    const onedoc = new Onedoc(ONEDOC_API_KEY);

    let doc = {
        html: await compile(<PDFTemplate data={data} type={type} />),
        title: "Hello",
        test: true, // if true, produce a PDF in test mode with a Onedoc's watermark
        save: true, // if true, host the document and provide a download link in the console and your Onedoc's dashboard
        expiresIn: 7, // the number of day you want to host your document
    };

    const { file, link, error, info } = await onedoc.render(doc);

    if (error) {
        throw error;
    }

    return link;
}

export default generate;