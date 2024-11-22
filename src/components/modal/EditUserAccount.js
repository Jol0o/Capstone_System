'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import QRCode from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

function EditUserAccount({ id }) {
    const [userForm, setUserForm] = useState({
        email: '',
    });

    const handleSubmit = () => { }

    const handleChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="justify-start w-full p-2" variant="ghost">Edit</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[400px]  sm:h-auto overflow-auto sm:max-w-[505px]">
                <DialogHeader>
                    <DialogTitle>Update Employee Info</DialogTitle>
                    <DialogDescription>
                        Create new employee by filling up the form below.
                    </DialogDescription>
                </DialogHeader>
                <div className="gap-4 py-4 ">
                    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                        <div className="grid gap-4">

                            <div className="grid items-center grid-cols-1 gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={userForm.email} onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                /></div>
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>
                        </div>
                        {userForm.name && (
                            <div className="hidden" ref={qrCodeRef}>
                                <QRCode size={200} level="M" value={userForm.name} />
                            </div>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditUserAccount