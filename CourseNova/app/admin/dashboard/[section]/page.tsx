"use client";

import { useParams } from "next/navigation";
import { AdminDashboardPageInner } from "../page";

export default function AdminDashboardSectionPage() {
  const params = useParams<{ section?: string }>();
  const section = (params?.section as string) || "user-management";

  const initialTab =
    section === "user-management"
      ? 0
      : section === "course-management"
        ? 1
        : 2;

  return <AdminDashboardPageInner initialTab={initialTab} />;
}

