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
import { loginAdmin, loginEmployeeApi, registerAdminAcc, registerUser } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

function LoginAdmin() {
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { auth, user } = useAuth();
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    if (auth) return router.push('/dashboard');

    const login = async () => {
        setLoading(true)
        if (!userForm.email || !userForm.password) {
            toast("Error", {
                description: 'Email and password are required',
            })
            setLoading(false)
            return;
        }

        try {
            const response = await loginAdmin(userForm)
            if (response.status === 200) {
                if (response.data.userType === 'employee') {
                    localStorage.setItem('user', JSON.stringify(response.data.user))
                    router.push('/dashboard')
                } else if (response.data.userType === 'admin') {
                    localStorage.setItem('admin', JSON.stringify(response.data.user))
                    router.push('/dashboard')
                }
            }
            setError("")
        } catch (error) {
            console.error('Login failed:', error.message)
            toast("Error", {
                description: error?.response?.data.message || error.message,
            })
        } finally {
            setLoading(false)
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
        setLoading(true);
        e.preventDefault();
        try {
            const response = await registerUser(userForm);
            toast("Successfull", {
                description: "Success creating an account!",
            });
            setError("");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast("Error", {
                    description: error.response.data.message,
                });
                console.error('Registration failed:', error.response.data.message);
            } else {
                toast("Error", {
                    description: "An unexpected error occurred",
                });
                console.error('Registration failed:', error.message);
            }
            setError(error.message);
        } finally {
            setLoading(false);
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
                <TabsTrigger value="account">Sign In</TabsTrigger>
                <TabsTrigger value="password">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <Card className="max-w-sm mx-auto">
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
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    id="password"
                                    value={userForm.password}
                                    onChange={handleChange}
                                    name="password"
                                    placeholder="Password"
                                />
                                <Button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center px-2"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={loading} onClick={login}>
                            {loading ? <LoaderCircle className="animate-spin" /> : 'Login'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Enter your employee credentials
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="name">Full Name</Label>
                            <Input type="name" required id="name" value={userForm.name} onChange={handleChange} name="name" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" required id="email" value={userForm.email} onChange={handleChange} name="email" placeholder="a@gmail.com" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                type="tel"
                                required
                                id="phone"
                                value={userForm.phone}
                                onChange={handleChange}
                                name="phone"
                                placeholder="Phone Number"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    id="password"
                                    value={userForm.password}
                                    onChange={handleChange}
                                    name="password"
                                    placeholder="Password"
                                />
                                <Button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center px-2"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button disabled={loading} onClick={register}>
                            {loading ? <LoaderCircle className="animate-spin" /> : 'Register'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default LoginAdmin