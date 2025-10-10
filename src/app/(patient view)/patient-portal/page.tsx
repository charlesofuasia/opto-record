import { PatientProvider } from "@/context/PatientContext";

export default function PatientPortalPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return (
    <PatientProvider patientId={id}>
      <div>
        <h1>Welcome to Patient Portal</h1>
        <p>Patient ID: {id}</p>
      </div>
    </PatientProvider>
  );
}
