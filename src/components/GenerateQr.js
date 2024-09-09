'use client'
import React, { useRef } from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import QRCode from 'qrcode.react';
import { ref, getDownloadURL, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { storage } from '../lib/firebase';


function GenerateQr() {
    const [url, setUrl] = React.useState("");
    const qrCodeRef = useRef(null);

    const downloadQRCode = async () => {
        const canvas = qrCodeRef.current.querySelector("canvas");
        canvas.toBlob(async (blob) => {
            let downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${url}.png`;
            document.body.appendChild(downloadLink);
            const downloadURL = await uploadFile(blob);
            console.log(downloadURL); // Log the download URL
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }, 'image/png');
    };

    const uploadFile = async (file) => {
        const storageRef = ref(storage, `qrCode/${url}.png`);
        const uploadTaskSnapshot = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
        return downloadURL;
    };

    return (
        <div className="flex flex-col items-center w-full gap-5">
            <h1 className="text-[20px] font-semibold">Generate Qr Code</h1>
            <form className="flex gap-2">
                <input
                    className="px-3 py-2 rounded-md"
                    placeholder="Enter URL"
                    type="text"
                    name="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button onClick={QRCode} type="button">
                    <PaperPlaneIcon />
                </button>
            </form>
            {url && (
                <div ref={qrCodeRef}>
                    <QRCode size={200} level="M" value={url} />
                </div>
            )}
            {url && (
                <button onClick={downloadQRCode}>
                    Download QR Code
                </button>
            )}
        </div>
    );
}

export default GenerateQr;