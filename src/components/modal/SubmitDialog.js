'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import axios from "axios"
import { LoaderCircle } from "lucide-react"
import React, { useEffect, useState } from 'react'

function SubmitDialog({ isLoading, onSubmit, label }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleConfirm = () => {
        setIsDialogOpen(false);
        onSubmit();
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button type="button" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Submit'}
                </Button>
            </DialogTrigger>
            <DialogContent className="h-[400px] sm:h-auto overflow-auto sm:max-w-[505px]">
                <DialogHeader>
                    <DialogTitle>Submit {label}</DialogTitle>
                </DialogHeader>
                <div className="gap-4 py-4">
                    <DialogFooter>
                        <Button onClick={handleCancel} className="w-full">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} className="w-full">
                            Confirm
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SubmitDialog