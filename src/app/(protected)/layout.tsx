"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import Sidebar from "../components/Sidebar";
import "../globals.css";
import Loading from "../components/Loading";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  const { user, isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading || !user || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background p-6">{children}</main>
    </div>
  );
}
