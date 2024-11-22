'use client'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Loader from '@/components/Loader'
import { getAdmins, registerAdminAcc, updateAdmin, removeAdmin } from '@/lib/api'
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from 'sonner'

function Page() {
    const { auth, user } = useAuth();
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', position: '' })
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [data, setData] = useState(null)
    const limit = 15
    const router = useRouter();

    const handleChange = (e) => {
        const { value, name } = e.target

        setUserForm(prevForm => ({ ...prevForm, [name]: value }))
    }

    useEffect(() => {
        if (user && user.status === "user") {
            router.push('/dashboard')
        }
    }, [user])

    useEffect(() => {
        const fetchAdmin = async () => {
            const res = await getAdmins(limit, page)
            if (res.status === 200) {
                console.log((res.data.data))
                setData(res.data.data)
                setTotalPages(res.data.totalPages)
            }
        }
        fetchAdmin()
    }, [page])

    if (!auth) return <Loader />;

    const handleNext = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrev = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    console.log(userForm)

    const registerAdmin = async (e) => {
        e.preventDefault();
        try {
            await registerAdminAcc(userForm)
                .then(() => {
                    toast("Successful", {
                        description: "Success creating an account!",
                    });
                    setUserForm({ name: '', email: '', password: '', position: '' });
                    window.location.reload();
                })
                .catch(error => {
                    console.log(error);
                    toast("Error", {
                        description: error?.response?.data.errors[0].msg,
                    });
                });
        } catch (error) {
            console.log(error);
            toast("Error", {
                description: error?.response?.data.errors[0].msg,
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const res = await updateAdmin(selectedAccount.id, userForm)
            if (res.status === 200) {
                toast("Successfull", {
                    description: "Success updating an account!",
                })
                setUserForm({ name: '', email: '', password: '', position: '' })
                window.location.reload();
            }
        } catch (e) {
            toast("Error", {
                description: e?.response?.data.errors[0].msg,
            })
        }
    }

    const handleRemove = async (id) => {
        try {
            const res = await removeAdmin(id)
            if (res.status === 200) {
                toast("Successfull", {
                    description: "Success deleting an account!",
                })
                window.location.reload();
            }
        } catch (e) {
            toast("Error", {
                description: e.message,
            })
        }
    }

    return (
        <div className="container py-10 mx-auto">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>Manage administrator accounts and their credentials</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.length > 0 ? data.map((account, index) => (
                                <TableRow key={account.id}>
                                    <TableCell>{account.name}</TableCell>
                                    <TableCell>{account.email}</TableCell>
                                    <TableCell>{account.position}</TableCell>
                                    {index !== 0 && <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account)}>
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Admin Account</DialogTitle>
                                                    <DialogDescription>Make changes to the admin account here.</DialogDescription>
                                                </DialogHeader>
                                                <AdminAccountForm account={selectedAccount} handleChange={handleChange} userForm={userForm} setUserForm={setUserForm} submit={handleUpdate} />
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="sm" onClick={() => handleRemove(account.id)} >
                                            Delete
                                        </Button>
                                    </TableCell>}
                                </TableRow>
                            )) : <TableRow >
                                <TableCell>No Data</TableCell>
                            </TableRow>
                            }
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Create New Admin Account</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Admin Account</DialogTitle>
                                <DialogDescription>Fill in the details for the new admin account.</DialogDescription>
                            </DialogHeader>
                            <AdminAccountForm userForm={userForm} handleChange={handleChange} setUserForm={setUserForm} submit={registerAdmin} />
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
            {data?.length > 0 && <div className="flex items-center justify-end py-4 space-x-2">
                <div className="flex items-center gap-2">
                    {totalPages !== '1' && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>}
                    <p className="flex items-center justify-center text-xs rounded-md w-7 h-7 bg-muted">{page}</p>
                    {totalPages !== page && <Button variant="ghost" className="w-8 h-8 p-0" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>}
                </div>
            </div>}
        </div>
    )
}

function AdminAccountForm({ account = {}, handleChange, userForm, submit, setUserForm }) {

    useEffect(() => {
        if (account && account.email && account.password && account.position && account.name) {
            setUserForm({ ...userForm, email: account.email, password: account.password, position: account.position, name: account.name })
        }
    }, [account])

    return (
        <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" name="name" value={userForm.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" value={userForm.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" type="text" name="position" value={userForm.position} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" value={userForm.password} onChange={handleChange} />
            </div>
            <DialogFooter>
                <Button type="submit">{account.id ? 'Update Account' : 'Create Account'}</Button>
            </DialogFooter>
        </form>
    )
}

export default Page