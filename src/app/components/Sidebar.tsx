"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
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
import { usePatient } from "@/context/PatientContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuthStore();
  const pathname = usePathname();

  // ✅ Call hook at the top level (no inline functions)
  let patientId: string | undefined = undefined;
  try {
    const patientContext = usePatient();
    patientId = patientContext?.patientId;
  } catch {
    // If not inside PatientContext, ignore
  }

  // 🧭 Build navigation items based on user role
  const navItems = useMemo(() => {
    if (!user) return [];

    switch (user.type) {
      case UserTypesEnum.Admin:
      case UserTypesEnum.Physician:
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Patients", href: "/patients", icon: Users },
          { name: "Appointments", href: "/appointments", icon: CalendarDays },
          { name: "Settings", href: "/settings", icon: Settings },
        ];

      case UserTypesEnum.Patient:
        return [
          {
            name: "Profile",
            href: `/patient-portal/${patientId || user.id}`,
            icon: LayoutDashboard,
          },
          { name: "Appointments", href: "/appointments", icon: CalendarDays },
          { name: "Settings", href: "/settings", icon: Settings },
        ];

      default:
        return [{ name: "Settings", href: "/settings", icon: Settings }];
    }
  }, [user, patientId]);

  // 🚪 Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } shadow-md h-screen transition-all duration-300 flex flex-col bg-primary text-white`}
    >
      {/* 🔷 Header / Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <span className="text-xl font-bold">{isOpen ? "OptoRecord" : "OR"}</span>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden hover:text-blue-300"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 🧭 Navigation Links */}
      <nav className="flex-1 px-2 py-6 space-y-3">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-white/20 text-blue-300 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              {isOpen && <span>{name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ⚙️ Footer */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <button className="flex items-center gap-3 hover:text-blue-300 w-full">
          <User className="h-5 w-5" />
          {isOpen && <span>Profile</span>}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-500 w-full"
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
