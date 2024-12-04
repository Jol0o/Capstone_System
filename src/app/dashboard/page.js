"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Home,
  Package2,
  User,
  FileCheck,
  Coins,
  Users,
  Clock,
  MoreHorizontal,
  PanelLeft,
  Package,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Dashboard from "./../../components/tabs/Dashboard";
import Employee from "@/components/tabs/Employee";
import Attendance from "@/components/tabs/Attendance";
import Profile from "@/components/tabs/Profile";
import Payroll from "@/components/tabs/Payroll";
import UserPayroll from "@/components/tabs/UserPayroll";
import LeaveRequest from "@/components/tabs/LeaveRequest";
import { logoutUser } from "@/lib/api";
import Request from "@/components/tabs/Request";
import UserAccounts from "@/components/tabs/UserAccounts";
import UserDashboard from "@/components/tabs/UserDashboard";
import Loader from "@/components/Loader";
import { ModeToggle } from "@/components/buttons/DarkMode";

const NAV_ITEMS = {
  admin: [
    { name: "Dashboard", icon: Home, tab: "dashboard" },
    { name: "Employee", icon: Users, tab: "employee" },
    { name: "Attendance", icon: Clock, tab: "attendance" },
    { name: "Payroll", icon: Coins, tab: "payroll" },
    { name: "Leave Request", icon: FileCheck, tab: "request" },
  ],
  user: [
    { name: "Dashboard", icon: Home, tab: "dashboard" },
    { name: "Profile", icon: User, tab: "profile" },
    { name: "Leave Request", icon: FileCheck, tab: "leave" },
    { name: "Payroll", icon: Coins, tab: "userpayroll" },
  ],
};

export default function Page() {
  const { auth, user } = useAuth();
  const [tab, setTab] = useState(() => {
    // Retrieve the tab state from localStorage when the component mounts
    if (typeof window !== "undefined") {
        return localStorage.getItem('tab') || 'dashboard';
    }
    return 'dashboard'; // Default value if window is undefined
});

const router = useRouter();

useEffect(() => {
    if (typeof window !== "undefined") {
        localStorage.setItem('tab', tab);
    }
}, [tab]);
  
  if (!auth) return <Loader />;

  // useEffect(() => {
  //     const date = new Date();
  //     const day = date.getDay();

  //     console.log(daysOfWeek.findIndex(item => item === daysOfWeek[day]));
  // }, []);

  async function logout() {
    try {
      await logoutUser(); // Removed the unused 'res' variable
      console.log("Logged Out");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      router.push("/");
    } catch (e) {
      console.log(e);
    }
  }

  const renderComponent = () => {
    const components = {
      dashboard: user.status === "admin" ? Dashboard : UserDashboard,
      employee: Employee,
      attendance: Attendance,
      payroll: Payroll,
      profile: Profile,
      leave: LeaveRequest,
      userpayroll: UserPayroll,
      request: Request,
      users: UserAccounts,
    };
    const Component = components[tab];
    return Component ? <Component setTab={setTab} /> : null;
  };

  const navItems = user.status === "admin" ? NAV_ITEMS.admin : NAV_ITEMS.user;

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden border-r w-54 bg-background sm:flex">
        <nav className="flex flex-col gap-4 px-2 sm:py-4">
          <Link
            href="#"
            className="flex items-center justify-center gap-2 text-lg font-semibold rounded-full group h-9 w-9 shrink-0 bg-primary text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="w-4 h-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {navItems.map((item) => (
            <TooltipProvider key={item.tab}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="#"
                    onClick={() => setTab(item.tab)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                      ${tab === item.tab
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-44">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="w-5 h-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.tab}
                    href="#"
                    onClick={() => setTab(item.tab)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                        ${tab === item.tab
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => setTab("dashboard")}>
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {tab !== "dashboard" && (
                <>
                  {" "}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="#" className="capitalize">
                        {tab}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />{" "}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-center gap-4">
            <ModeToggle />

            <DropdownMenu>
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
                {user.status === "admin" && <>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/admin-accounts")}>
                    Manage Admin
                  </DropdownMenuItem></>}
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-[5px] py-5 md:p-5">{renderComponent()}</main>
      </div>
    </div>
  );
}
