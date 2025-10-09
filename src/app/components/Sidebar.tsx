"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { UserTypesEnum } from "@/constants/roles.enum";

interface User {
  id: string;
  type: string;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuthStore();

  // Build nav items based on user type
  const navItems =
    user?.type == UserTypesEnum.Admin || user?.type == UserTypesEnum.Physician
      ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Patients", href: "/patients", icon: Users },
        { name: "Appointments", href: "/appointments", icon: CalendarDays },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
      : user?.type === UserTypesEnum.Patient
        ? [
          {
            name: "Profile",
            href: `/patient-portal/${user?.id}`,
            icon: LayoutDashboard,
          },
          {
            name: "Appointments",
            href: `/appointments`,
            icon: CalendarDays,
          },
          { name: "Settings", href: "/settings", icon: Settings },
        ]
        : [{ name: "Settings", href: "/settings", icon: Settings }];

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-20"
        } shadow-md h-screen transition-all duration-300 flex flex-col bg-primary`}
    >
      {/* Logo / Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <span className="text-xl font-bold">
          {isOpen ? "OptoRecord" : "CM"}
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-600 hover:text-blue-600"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-6 space-y-4">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className="flex items-center space-x-3 hover:text-blue-600"
          >
            <Icon className="h-5 w-5" />
            {isOpen && <span>{name}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <button className="cursor-pointer flex items-center space-x-3 hover:text-blue-600 w-full">
          <User className="h-5 w-5" />
          {isOpen && <span>Profile</span>}
        </button>
        <button
          className="cursor-pointer flex items-center space-x-3 text-red-600 hover:text-red-700 mt-3 w-full"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });
            } catch (e) {
              console.error(e);
            } finally {
              window.location.href = "/";
            }
          }}
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
