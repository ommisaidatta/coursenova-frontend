"use client";
import { useState, FormEvent } from "react";
import {
  Box,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CommonButton from "../../component/button";
import CommonInput from "../../component/inputfield";
import CommonToast from "../../component/alertToast";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/students/login", {
        email,
        password,
      });

      const data = res.data;
      const role = data.role || data.student?.role || "student";

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", role);

      setToast({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
      setEmail("");
      setPassword("");

      setTimeout(() => {
        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      }, 800);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Server not responding";
      setToast({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleForgotPassword = () => setForgotOpen(true);

  const sendResetLink = async () => {
    if (!forgotEmail) {
      setToast({
        open: true,
        message: "Email is required",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setToast({
          open: true,
          message: data.message || "Email not found",
          severity: "error",
        });
        return;
      }

      setToast({
        open: true,
        message: "Reset link sent to your email",
        severity: "success",
      });

      setForgotOpen(false);
      setForgotEmail("");
    } catch {
      setToast({
        open: true,
        message: "Server not responding",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420, px: { xs: 0.5, sm: 0 } }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
        Welcome Back
      </Typography>

      <form onSubmit={handleLogin}>
        <Box display="grid" gap={2}>
          <CommonInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
          <CommonInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />
          <Box display="flex" justifyContent="flex-end">
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
              sx={{
                fontWeight: 500,
                textDecoration: "none",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot password?
            </Link>
          </Box>
        </Box>

        <CommonButton
          label="LOGIN"
          type="submit"
          fullWidth
          sx={{ mt: 3, p: { xs: 1.2, sm: 1.5 } }}
        />
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <CommonInput
            label="Enter your Email"
            name="email"
            type="email"
            value={forgotEmail}
            onChange={(e: any) => setForgotEmail(e.target.value)}
          />
          <CommonButton
            label={loading ? "sending..." : "Send Reset Link"}
            onClick={sendResetLink}
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
      </Dialog>

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
