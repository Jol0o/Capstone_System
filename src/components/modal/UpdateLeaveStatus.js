'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import axios from "axios"
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateLeaveStatus } from "@/lib/api"

function UpdateLeaveStatus({ data }) {
    const [status, setStatus] = useState('')

    const handleChange = (value) => {
        setStatus(value);
    };

    console.log(status)

    const handleUpdate = async () => {
        if (status === "") return
        try {
            const res = await updateLeaveStatus(data.id , status)
            if (res.status === 200) {
                 toast(`Successfully updated the status`);
            }
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="justify-start w-full p-2" variant="ghost">Update Status</Button>
            </DialogTrigger>
            <DialogContent className="h-[400px] sm:h-auto overflow-auto sm:max-w-[505px]">
                <DialogHeader>
                    <DialogTitle>Update Leave Status</DialogTitle>
                    <DialogDescription>
                        Update the status of the leave request.
                    </DialogDescription>
                </DialogHeader>
                <div className="gap-4 p-3 py-4 border border-gray-400 rounded-lg ">
                    <h1 className="font-medium text-md">Name: {data.name}</h1>
                    <p className="text-sm font-normal text-gray-200">Leave Type: {data.leave_type}</p>
                    <p className="mb-3 text-sm font-normal text-gray-200">Leave Reason: {data.reason}</p>
                    <Select value={status} onValueChange={handleChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={status === "" ? data?.status : status} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Process">Process</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                     <Button onClick={handleUpdate} className="w-full mt-3">
                    Submit
                </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateLeaveStatus