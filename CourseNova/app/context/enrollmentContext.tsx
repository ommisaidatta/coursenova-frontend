"use client";

import { createContext, useContext, useState } from "react";

const EnrollmentContext = createContext<any>(null);

export function EnrollmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshEnrollments = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <EnrollmentContext.Provider value={{ refreshKey, refreshEnrollments }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export const useEnrollment = () => useContext(EnrollmentContext);
