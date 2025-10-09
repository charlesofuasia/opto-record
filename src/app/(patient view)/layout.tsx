import Sidebar from "../components/Sidebar";
import { PatientProvider } from "@/context/PatientContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout itself doesn’t know patientId — pages under /[id] will wrap it
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background p-6">{children}</main>
    </div>
  );
}
