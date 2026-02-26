"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import DashboardCards from "../cards";
import DashboardCourses from "../courseList";
import { useEnrollment } from "@/app/context/enrollmentContext";
import axiosInstance from "@/app/utils/axiosInstance";

export default function DashboardContent() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificatesByCourseId, setCertificatesByCourseId] = useState<
    Record<string, any>
  >({});
  const { refreshKey } = useEnrollment();

  useEffect(() => {
    axiosInstance
      .get("/enroll/my")
      .then((res) => {
        setEnrollments(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        setEnrollments([]);
      });
  }, [refreshKey]);

  useEffect(() => {
    axiosInstance
      .get("/certificates/my-certificates")
      .then((res) => {
        const certs = Array.isArray(res.data) ? res.data : [];
        const map: Record<string, any> = {};
        certs.forEach((cert: any) => {
          const courseId =
            typeof cert.courseId === "object"
              ? cert.courseId._id
              : cert.courseId;
          map[String(courseId)] = cert;
        });
        setCertificatesByCourseId(map);
      })
      .catch(() => {});
  }, [refreshKey]);

  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter(
    (e) => e.status === "Completed",
  ).length;
  const inProgressCount = enrollments.filter(
    (e) => e.status === "Active",
  ).length;

  return (
    <Box>
      <DashboardCards
        enrolled={enrolledCount}
        inProgress={inProgressCount}
        completed={completedCount}
      />

      <Box mt={4}>
        <DashboardCourses
          enrollments={enrollments}
          certificatesByCourseId={certificatesByCourseId}
        />
      </Box>
    </Box>
  );
}
