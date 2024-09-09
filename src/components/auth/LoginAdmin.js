'use client'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"
import { loginAdmin, loginEmployeeApi, registerAdminAcc, registerUserAdmin } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

function LoginAdmin() {
    const [userForm, setUserForm] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const { auth, user } = useAuth();
    const router = useRouter()


    if (auth) return router.push('/dashboard');

    const login = async () => {
        if (!userForm.email || !userForm.password) {
            toast("Error", {
                description: 'Email and password are required',
            })
            return;
        }

        try {
            const response = await loginAdmin(userForm)
            // localStorage.setItem('token', response.data.token)
            localStorage.setItem('admin', JSON.stringify(response.data.admin))
            router.push('/dashboard')
            setError("")
        } catch (error) {
            console.error('Login failed:', error.message)
            toast("Error", {
                description: error.response.data.message,
            })
        }
    }

    const loginEmployee = async (e) => {
        e.preventDefault();
        if (!userForm.email || !userForm.password) {
            toast("Error", {
                description: 'Email and password are required',
            })
            return;
        }
        try {
            const response = await loginEmployeeApi(userForm)
            // localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            router.push('/dashboard')
            setError("")
        } catch (error) {
            toast("Error", {
                description: error.response.data.message,
            })

        }
    }

    const register = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUserAdmin(userForm)
                .then(() => {
                    toast("Successfull", {
                        description: "Success creating an account!",
                    })
                    setError("")
                })
                .catch(error => {
                    toast("Error", {
                        description: error.response.data.errors[0].msg,
                    })
                });
        } catch (error) {
            console.error('Login failed:', error)
            setError(error.message)
        }
    };

    const registerAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await registerAdminAcc(userForm)
                .then(() => {
                    toast("Successfull", {
                        description: "Success creating an account!",
                    })
                    setError("")
                })
                .catch(error => {
                    toast("Error", {
                        description: error.response.data.errors[0].msg,
                    })
                });
        } catch (error) {
            console.error('Login failed:', error)
            toast("Error", {
                description: error.response.data.errors[0].msg,
            })
        }
    };


    const handleChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value,
        });
    }

    return (
        <Tabs defaultValue="account" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Admin</TabsTrigger>
                <TabsTrigger value="password">Employee</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Enter your admin credentials
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" required id="email" value={userForm.email} onChange={handleChange} name="email" placeholder="a@gmail.com" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" required id="password" value={userForm.password} onChange={handleChange} name="password" placeholder="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={login}>Login</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Enter your employee credentials
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" required id="email" value={userForm.email} onChange={handleChange} name="email" placeholder="a@gmail.com" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" required id="password" value={userForm.password} onChange={handleChange} name="password" placeholder="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={loginEmployee}>Login</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default LoginAdmin