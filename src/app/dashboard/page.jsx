import { AppBottombar } from "@/components/app-bottombar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ChevronsUpDown, Key, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../auth/ChangePassword";
import { useState } from "react";
import logo from "../../assets/logo.png"


// eslint-disable-next-line react/prop-types
export default function Page({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Get user data from localStorage
  const nameL = localStorage.getItem("name");
  const emailL = localStorage.getItem("email");
  const user_position = localStorage.getItem("user_position");

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Create initials from user name
  const splitUser = nameL || "";
  const initialsChar = splitUser
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();


  return (
    <SidebarProvider>
      {/* Desktop/Tablet Layout - Show sidebar normally */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset>
        {/* Header that appears on all screens */}
        <header className="hidden sm:flex flex-row justify-between h-16 shrink-0   items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">

            <SidebarTrigger className="-ml-1 hover:bg-yellow-100" />
            <Separator orientation="vertical" className="mr-2 h-4 inline-block" />



            {/* Breadcrumb visible on all screens */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={handleBackClick}
                    className="flex items-center gap-2 text-muted-foreground hover:text-yellow-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>





        {/* Mobile header text - only shown on sm screens */}

        <div className="sm:hidden sticky top-0 flex justify-between items-center px-4 py-2  border-b z-40 bg-white  rounded-b-lg shadow-sm">
          <div className="font-semibold flex items-center space-x-2">
            <div className="flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-800">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-yellow-900 leading-tight">Elgres Ceramic</span>

            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-8 w-8 border-2 border-yellow-300 rounded-lg shadow-sm">
                  <AvatarImage src="/avatars/shadcn.jpg" alt={nameL} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold text-xs">
                    {initialsChar}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border border-yellow-200 shadow-lg" side="bottom" align="end" sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 p-3 text-left text-sm bg-yellow-50 rounded-t-xl">
                  <Avatar className="h-10 w-10 rounded-full border-2 border-yellow-300">
                    <AvatarImage src="/avatars/shadcn.jpg" alt={nameL} />
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold">
                      {initialsChar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-yellow-900">{nameL}</span>
                    <span className="truncate text-xs text-yellow-700">{emailL}</span>
                    <span className="text-xs text-green-600 font-medium mt-0.5 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-yellow-200" />
              <DropdownMenuItem className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md my-0.5 mx-1" onClick={() => setOpen(true)}>
                <Key className="mr-2 h-4 w-4 text-yellow-700" />
                <span className="cursor-pointer">Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md my-0.5 mx-1" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 text-yellow-700" />
                <span className="cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>










        {/* Main content area - adjusted for mobile bottom nav */}
        <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 pt-0">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 rounded-xl p-2 pb-16  md:pb-2">
            {children}
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="sm:hidden ">
          <AppBottombar />
        </div>
        <ChangePassword setOpen={setOpen} open={open} />
      </SidebarInset>
    </SidebarProvider>
  );
}