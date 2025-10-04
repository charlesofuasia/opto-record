import Sidebar from "../components/Sidebar";

interface Props {
    children: React.ReactNode;
    patientId: string;
}

export default function ProtectedLayout({ children, patientId }: Props) {
    return (
        <div className="flex">
            <Sidebar patientId={patientId} />
            <main className="flex-1 bg-background p-6">{children}</main>
        </div>
    );
}
