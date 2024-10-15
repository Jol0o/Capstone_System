'use client'
import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    CreditCard,
    File,
    Home,
    LineChart,
    ListFilter,
    MoreVertical,
    Package,
    Package2,
    PanelLeft,
    Search,
    Settings,
    User,
    Truck,
    Users2,
    Coins,
    FileCheck,
    Users
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,

    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Dashboard from './../../components/tabs/Dashboard';
import Employee from "@/components/tabs/Employee"
import Attendance from "@/components/tabs/Attendance"
import Profile from "@/components/tabs/Profile"
import Payroll from "@/components/tabs/Payroll"
import UserPayroll from "@/components/tabs/UserPayroll"
import LeaveRequest from "@/components/tabs/LeaveRequest"
import { logoutUser } from "@/lib/api"
import Request from "@/components/tabs/Request"
import UserAccounts from "@/components/tabs/UserAccounts"
import Loader from "@/components/Loader"
import { ModeToggle } from "@/components/buttons/DarkMode"

export default function Page() {
    const { auth, user } = useAuth();
    const [tab, setTab] = useState("dashboard");
    const router = useRouter();

    useEffect(() => {
        if (user && user.status === "user") {
            setTab("profile")
        }
    }, [user])

    if (!auth) return <Loader />;


    // useEffect(() => {
    //     const date = new Date();
    //     const day = date.getDay();

    //     console.log(daysOfWeek.findIndex(item => item === daysOfWeek[day]));
    // }, []);

    async function logout() {
        try {
            await logoutUser(); // Removed the unused 'res' variable
            console.log('Logged Out');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('admin');
            router.push("/");
        } catch (e) {
            console.log(e);
        }
    }

    const renderComponent = () => {
        if (user?.status === 'admin' && tab === 'dashboard') {
            return <Dashboard />
        } else if (user?.status === 'admin' && tab === 'employee') {
            return <Employee setTab={setTab} />
        } else if (user?.status === 'admin' && tab === 'attendance') {
            return <Attendance />
        } else if (user?.status === 'admin' && tab === 'payroll') {
            return <Payroll />
        } else if (tab === 'profile') {
            return <Profile />
        } else if (tab === 'leave') {
            return <LeaveRequest />
        } else if (tab === 'userpayroll') {
            return <UserPayroll />
        } else if (tab === 'request') {
            return <Request />
        } else if (tab === 'users') {
            return <UserAccounts />
        }
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden border-r w-14 bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
                    <Link
                        href="#"
                        className="flex items-center justify-center gap-2 text-lg font-semibold rounded-full group h-9 w-9 shrink-0 bg-primary text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <Package2 className="w-4 h-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">Acme Inc</span>
                    </Link>
                    {user.status === 'admin' ? <><TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="#"
                                    onClick={() => setTab("dashboard")}
                                    className={`${tab === "dashboard" ? "bg-accent" : ""
                                        } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                >
                                    <Home className="w-5 h-5" />
                                    <span className="sr-only">Dashboard</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Dashboard</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("users")}
                                        className={`${tab === "users" ? "bg-accent" : ""
                                            } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="sr-only">Users Account</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">Users Account</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("employee")}
                                        className={`${tab === "employee" ? "bg-accent" : ""
                                            } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="sr-only">Employee</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">Employee</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("attendance")}
                                        className={`${tab === "attendance" ? "bg-accent" : ""
                                            } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                    >
                                        <Package className="w-5 h-5" />
                                        <span className="sr-only">Attendance</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">Attendance</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("payroll")}
                                        className={`${tab === "payroll" ? "bg-accent" : ""
                                            } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                    >
                                        <Coins className="w-5 h-5" />
                                        <span className="sr-only">Payroll</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">Payroll</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("request")}
                                        className={`${tab === "request" ? "bg-accent" : ""
                                            } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                    >
                                        <FileCheck className="w-5 h-5" />
                                        <span className="sr-only">Leave Request</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">Leave Request</TooltipContent>
                            </Tooltip>
                        </TooltipProvider></> :
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href="#"
                                            onClick={() => setTab("profile")}
                                            className={`${tab === "profile" ? "bg-accent" : ""
                                                } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="sr-only">Profile</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Profile</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href="#"
                                            onClick={() => setTab("leave")}
                                            className={`${tab === "leave" ? "bg-accent" : ""
                                                } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                        >
                                            <FileCheck className="w-5 h-5" />
                                            <span className="sr-only">Leave Request</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Leave Request</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href="#"
                                            onClick={() => setTab("userpayroll")}
                                            className={`${tab === "userpayroll" ? "bg-accent" : ""
                                                } flex items-center justify-center transition-colors rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground md:h-8 md:w-8`}
                                        >
                                            <Coins className="w-5 h-5" />
                                            <span className="sr-only">Payroll</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Payroll</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    }
                </nav>

            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <PanelLeft className="w-5 h-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs">
                            {user.status === 'admin' ? <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center justify-center w-10 h-10 gap-2 text-lg font-semibold rounded-full group shrink-0 bg-primary text-primary-foreground md:text-base"
                                >
                                    <Package2 className="w-5 h-5 transition-all group-hover:scale-110" />
                                    <span className="sr-only">Acme Inc</span>
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("dashboard")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="w-5 h-5" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("users")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                    <Users className="w-5 h-5" />
                                    Users
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("employee")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <User className="w-5 h-5" />
                                    Employee
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("attendance")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Package className="w-5 h-5" />
                                    Attendance
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("payroll")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Coins className="w-5 h-5" />
                                    Payroll
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setTab("request")}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <FileCheck className="w-5 h-5" />
                                    Leave Request
                                </Link>

                            </nav> :
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link
                                        href="#"
                                        className="flex items-center justify-center w-10 h-10 gap-2 text-lg font-semibold rounded-full group shrink-0 bg-primary text-primary-foreground md:text-base"
                                    >
                                        <Package2 className="w-5 h-5 transition-all group-hover:scale-110" />
                                        <span className="sr-only">Acme Inc</span>
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("profile")}
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <User className="w-5 h-5" />
                                        Profile
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("leave")}
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <FileCheck className="w-5 h-5" />
                                        Leave Request
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => setTab("userpayroll")}
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <Coins className="w-5 h-5" />
                                        Payrolls
                                    </Link>
                                </nav>}
                        </SheetContent>
                    </Sheet>
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#" onClick={() => setTab('dashboard')}>Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {tab !== "dashboard" && <> <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="#" className="capitalize">{tab}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator /> </>}

                        </BreadcrumbList>
                    </Breadcrumb>
                    
                    <div className="flex items-center justify-center gap-4">
                    <ModeToggle />
                    {user.status === 'admin' && <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="overflow-hidden rounded-full"
                            >
                                <Image
                                    src="https://res.cloudinary.com/dkibnftac/image/upload/v1696743505/wp8137478_ei7mcp.jpg"
                                    width={36}
                                    height={36}
                                    alt="Avatar"
                                    className="overflow-hidden rounded-full"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    }</div>
                </header>
                <main className="p-5">
                    {renderComponent()}
                </main>
            </div>
        </div>
    )
}
