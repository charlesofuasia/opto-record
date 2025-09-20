"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Users, CalendarDays, BarChart2, Settings, User } from "lucide-react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: CalendarDays },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md">
      {/* Top navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-blue-600">
            OptoRecord
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6">
            {navItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Link>
            ))}
          </div>

          {/* Profile / Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-gray-50 border-t">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={href}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </Link>
          ))}
          <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
          <button className="w-full bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
