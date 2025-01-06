'use client'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, EyeOff, Save, LogOut } from 'lucide-react'
import useAuth from '@/hooks/useAuth';
import { logoutUser, getAdminData, updateAdmin } from "@/lib/api";
import Loader from '../Loader';
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { useStore } from '@/hooks/useStore'

export function AdminProfile() {
    const { user } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("john.doe@example.com")
    const [name, setName] = useState("")
    const [position, setPosition] = useState("System Administrator")
    const [isLoading, setIsLoading] = useState(false)
      const { removeAllUser } = useStore();
    const router = useRouter()

    useEffect(() => {
        if (!user) return;
        setIsLoading(true)
        const fetchAdmin = async () => {
            if (!user.email) return;
            try {
                const res = await getAdminData(user.email);
                const { data } = res.data
                setPassword(data.password);
                setEmail(data.email);
                setPosition(data.position || user.position);
                setName(data.name || user.name)
                console.log('Admin',user)
                setIsLoading(false)
            } catch (e) {
                console.log(e);
                setIsLoading(false)
            }
        };

        fetchAdmin();
    }, [user]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePositionChange = (e) => {
        setPosition(e.target.value)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!user || !user.id) return
        try {
            const userForm = {
                name,
                email,
                password,
                position
            }
            const res = await updateAdmin(user.id, userForm)
            if (res.status === 200) {
                // Update the email in localStorage
                const localStorageAdmin = JSON.parse(localStorage.getItem('admin'));
                if (localStorageAdmin) {
                    localStorageAdmin.email = email;
                    localStorageAdmin.name = name;
                    localStorageAdmin.position = position;
                    localStorage.setItem('admin', JSON.stringify(localStorageAdmin));
                }

                toast("Successful", {
                    description: "Success updating an account!",
                })
                window.location.reload();
            }
        } catch (e) {
            console.log(e)
            toast("Error", {
                description: e?.response?.data.errors[0].msg || e.message,
            })
        }
    }

    async function logout() {
        try {
            await logoutUser(); // Removed the unused 'res' variable
            console.log("Logged Out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("admin");
            localStorage.removeItem("tab");
            localStorage.removeItem("userEmail");
            removeAllUser()
            router.push("/");
        } catch (e) {
            console.log(e);
        }
    }

    if (isLoading) return <Loader />

    return (
        <div className="container p-6 mx-auto">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="flex flex-col items-center gap-4">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src="https://res.cloudinary.com/dkibnftac/image/upload/v1736055684/472310634_573909112071832_6346957760146667703_n_ltzgz5.png" alt="Admin Avatar" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <CardTitle className="text-3xl font-bold">{name || "No Name Available"}</CardTitle>
                        <div className="flex items-center gap-1">
                            <CardDescription className="text-xl">
                                {position || "No Position Available"}
                            </CardDescription>
                            <Badge variant="secondary" className="ml-2">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={position}
                                onChange={handlePositionChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password || ""}
                                    onChange={handlePasswordChange}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -translate-y-1/2 right-2 top-1/2"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button onClick={handleUpdate} className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-auto py-4" onClick={() => router.push('/admin-accounts')}>
                                Manage Admins
                            </Button>
                            <Button variant="outline" className="h-auto py-4" onClick={() => router.push('/dashboard')}>
                                Dashboard
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}