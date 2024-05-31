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
import UserForm from "../form/UserForm"
import { CirclePlus } from 'lucide-react'

function AddEmployee() {

    let token
    if (typeof window !== 'undefined') {
        // Now we are in the client-side context
        token = localStorage.getItem('token');
        // rest of your code
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1 h-7"> <CirclePlus className="h-3.5 w-3.5" /> Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="h-[400px] sm:h-auto overflow-auto sm:max-w-[505px]">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Create new employee by filling up the form below.
                    </DialogDescription>
                </DialogHeader>
                <div className="gap-4 py-4 ">
                    <UserForm token={token} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddEmployee