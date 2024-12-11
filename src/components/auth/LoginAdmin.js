"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import {
    loginAdmin,
    loginEmployeeApi,
    registerAdminAcc,
    registerUser,
    forgatPassword,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

function LoginAdmin() {
    const [userForm, setUserForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { auth, user } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [loadReset, setLoadReset] = useState(false);
    const [email, setEmail] = useState("");

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoadReset(true);
        if (!email) return;
        try {
            const res = await forgatPassword(email);
            if (res.status === 200) {
                setResetSuccess(true);
                setLoadReset(false);
            }
        } catch (e) {
            console.log(e);
            toast("Error", {
                description: e?.response?.data.message || e.message,
            });
            setLoadReset(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (auth) return router.push("/dashboard");

    const login = async () => {
        setLoading(true);
        if (!userForm.email || !userForm.password) {
            toast("Error", {
                description: "Email and password are required",
            });
            setLoading(false);
            return;
        }

        try {
            const response = await loginAdmin(userForm);
            if (response.status === 200) {
                if (response.data.userType === "employee") {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    router.push("/dashboard");
                } else if (response.data.userType === "admin") {
                    localStorage.setItem("admin", JSON.stringify(response.data.user));
                    router.push("/dashboard");
                }
            }
            setError("");
        } catch (error) {
            console.error("Login failed:", error.message);
            toast("Error", {
                description: error?.response?.data.message || error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const loginEmployee = async (e) => {
        e.preventDefault();
        if (!userForm.email || !userForm.password) {
            toast("Error", {
                description: "Email and password are required",
            });
            return;
        }
        try {
            const response = await loginEmployeeApi(userForm);
            // localStorage.setItem('token', response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user));
            router.push("/dashboard");
            setError("");
        } catch (error) {
            toast("Error", {
                description: error.response.data.message,
            });
        }
    };

    const register = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            if (userForm.password !== userForm.confirmPassword) return toast.error("Password is incorrect or does not match");

            const userData = {
                ...userForm,
                name: `${userForm.firstname} ${userForm.lastname}`
            };

            const response = await registerUser(userData);
            toast("Successfull", {
                description: "Success creating an account! Just wait until your account is approved by the admin",
            });
            setUserForm({
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                phone: "",
                confirmPassword: ""
            });
            setError("");
        } catch (error) {
            toast("Error", {
                description: error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Failed to save data. Please try again.",
            });
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
                    });
                    setError("");
                })
                .catch((error) => {
                    toast("Error", {
                        description: error.response.data.errors[0].msg,
                    });
                });
        } catch (error) {
            console.error("Login failed:", error);
            toast("Error", {
                description: error.response.data.errors[0].msg,
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserForm({
            ...userForm,
            [name]: value,
        });
    };

    return (
        <div className="flex flex-col max-w-[300px] items-center justify-center m-auto">
            <Image
                src="/Logo2.png"
                alt="logo"
                width={300}
                height={200}
                className="object-cover max-h-[150px]"
            />
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Sign In</TabsTrigger>
                    <TabsTrigger value="password">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card className="max-w-sm mx-auto">
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Enter your admin credentials</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    required
                                    id="email"
                                    value={userForm.email}
                                    onChange={handleChange}
                                    name="email"
                                    placeholder="a@gmail.com"
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
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-col items-center justify-center w-full gap-3">
                                <Button disabled={loading} className="w-full" onClick={login}>
                                    {loading ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                                <button
                                    onClick={() => setForgotPasswordOpen(true)}
                                    className="w-full text-sm text-center text-gray-400 hover:text-white"
                                >
                                    Forgat password?
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Register</CardTitle>
                            <CardDescription>Enter your employee credentials</CardDescription>
                        </CardHeader>
                        <form onSubmit={register}>
                            <CardContent className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="firstname">First Name</Label>
                                        <Input
                                            type="text"
                                            required
                                            id="firstname"
                                            value={userForm.firstname}
                                            onChange={handleChange}
                                            name="firstname"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="lastname">Last Name</Label>
                                        <Input
                                            type="text"
                                            required
                                            id="lastname"
                                            value={userForm.lastname}
                                            onChange={handleChange}
                                            name="lastname"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        required
                                        id="email"
                                        value={userForm.email}
                                        onChange={handleChange}
                                        name="email"
                                        placeholder="a@gmail.com"
                                    />
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
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            id="password"
                                            value={userForm.confirmPassword}
                                            onChange={handleChange}
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                        />
                                        <Button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 flex items-center px-2"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        "Register"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogContent className="text-white bg-gray-900">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {!resetSuccess
                                ? "Enter your email address and we'll send you instructions to reset your password."
                                : "Password reset instructions have been sent to your email. Please check your inbox."}
                        </DialogDescription>
                    </DialogHeader>

                    {!resetSuccess ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email address</Label>
                                <div className="relative">
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-transparent border-gray-700"
                                        required
                                    />
                                    <Mail
                                        className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                                        size={20}
                                    />
                                </div>
                            </div>
                            <Button disabled={loadReset} type="submit" className="w-full">
                                {loadReset ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    "Send Reset Instructions"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <Button
                            onClick={() => {
                                setForgotPasswordOpen(false);
                                setResetSuccess(false);
                                setEmail("");
                            }}
                            className="w-full"
                        >
                            Close
                        </Button>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default LoginAdmin;
