"use client";

import { Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import AuthLeftPanel from "./component/authLeftPanel";
import RegisterForm from "./auth/register";
import LoginForm from "./auth/login/page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        const role = localStorage.getItem("role");
        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:5000/api/students/refresh-token",
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.accessToken);
          const role = data.role || "student";
          localStorage.setItem("role", role);
          if (role === "admin") {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
      } catch {
        // If refresh fails, stay on auth page.
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAlreadyLoggedIn();
  }, [router]);

  // Don't render auth UI until auth check is complete
  if (checkingAuth) {
    return null; // or a loading spinner
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f7fb",
      }}
    >
      <Grid
        container
        sx={{
          width: { xs: "95%", sm: "90%" },
          maxWidth: 1100,
          minHeight: { xs: "auto", md: 600 },
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          borderRadius: { xs: 3, md: 6 },
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        {/* LEFT PANEL */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AuthLeftPanel />
        </Grid>

        {/* RIGHT PANEL */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: { xs: "center", md: "center" },
            px: { xs: 2, md: 4 },
            py: { xs: 1, md: 2 },
          }}
        >
          <Box width="100%" maxWidth={420}>
            {mode === "register" ? <RegisterForm /> : <LoginForm />}

            <Button
              fullWidth
              sx={{ mt: 2 }}
              onClick={() =>
                setMode(mode === "register" ? "login" : "register")
              }
            >
              {mode === "register"
                ? "Already have an account? Login"
                : "New user? Register"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
