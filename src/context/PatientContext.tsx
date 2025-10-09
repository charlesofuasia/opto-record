"use client";

import React, { createContext, useContext } from "react";

interface PatientContextType {
  patientId: string;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({
  patientId,
  children,
}: {
  patientId: string;
  children: React.ReactNode;
}) {
  return (
    <PatientContext.Provider value={{ patientId }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
