"use client";

import { Grid, Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "../component/sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../component/header";
import AllCoursesContent from "./sections/allcoursescontent";
import MyCoursesContent from "./sections/myCourses/mycoursescontent";
import ProfileContent from "./sections/profilecontent";
import DashboardContent from "./sections/dashboardcontent";
import MyCertificatesContent from "./sections/myCertificates/page";
import CommonToast from "../component/alertToast";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const VALID_SECTIONS = [
  "dashboard",
  "courses",
  "my-courses",
  "certificates",
  "profile",
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [searchText, setSearchText] = useState("");

  const [filters, setFilters] = useState({
    level: "",
    category: "",
    enrollment: "",
    rating: "",
  });

  const sectionFromUrl = searchParams.get("section");
  const activeSection = VALID_SECTIONS.includes(sectionFromUrl ?? "")
    ? sectionFromUrl!
    : "dashboard";

  const changeSection = (section: string) => {
    router.push(`/dashboard?section=${section}`);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    changeSection("courses");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "courses":
        return <AllCoursesContent searchText={searchText} filters={filters} />;
      case "my-courses":
        return <MyCoursesContent />;
      case "certificates":
        return <MyCertificatesContent />;
      case "profile":
        return <ProfileContent />;
      default:
        return <DashboardContent />;
    }
  };

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/students/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        router.push("/");
        return;
      }

      if (role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }

      try {
        const res = await axiosInstance.post("/students/refresh-token");
        if (res.data?.accessToken) {
          localStorage.setItem("token", res.data.accessToken);
          if (res.data?.role) localStorage.setItem("role", res.data.role);
        }
      } catch {
        localStorage.removeItem("token");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {isDesktop && (
        <Grid
          size={2.4}
          sx={{
            height: "100%",
          }}
        >
          <Sidebar
            active={activeSection}
            onChange={changeSection}
            onLogout={handleLogout}
          />
        </Grid>
      )}

      <Grid
        size={{ xs: 12, md: 9.6 }}
        sx={{
          bgcolor: "#f8fafc",
          height: "100vh",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Header
            onSearch={handleSearch}
            onFilterChange={setFilters}
            activeSection={activeSection}
            onSectionChange={changeSection}
            onLogout={handleLogout}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pl: { xs: 1.5, sm: 2, md: 2 },
            pr: { xs: 1.5, sm: 2, md: 2 },
            py: { xs: 2, md: 3 },
          }}
        >
          {renderContent()}
        </Box>
      </Grid>

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Grid>
  );
}
