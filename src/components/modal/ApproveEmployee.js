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
import { Label } from "../ui/label"
import { Input } from "../ui/input"

function ApproveEmployee({ data }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    console.log(data)

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1 h-7">Approve</Button>
            </DialogTrigger>
            <DialogContent className="h-[400px] overflow-auto sm:h-[705px] ">
                <DialogHeader>
                    <DialogTitle>Approve Employee Request </DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[705px] gap-4 py-4">
                    <UserForm data={data} setIsDialogOpen={setIsDialogOpen} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ApproveEmployee