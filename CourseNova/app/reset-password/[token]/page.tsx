"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import CommonInput from "@/app/component/inputfield";
import CommonButton from "@/app/component/button";
import CommonToast from "@/app/component/alertToast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const validatePassword = (password: string) => {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password) &&
      password.length >= 6
    );
  };

  const handleReset = async () => {
    if (!validatePassword(password)) {
      setToast({
        open: true,
        message:
          "Password must contain uppercase, lowercase, number, special char and 6+ length",
        severity: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setToast({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setToast({
          open: true,
          message: data.message || "Password reset failed",
          severity: "error",
        });
        return;
      }

      setToast({
        open: true,
        message: "Password reset successfully!",
        severity: "success",
      });

      setPassword("");
      setConfirmPassword("");
    } catch {
      setToast({
        open: true,
        message: "Server not responding",
        severity: "error",
      });
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h5" mb={2}>
        Reset Password
      </Typography>
      <CommonInput
        label="New Password"
        name="New Password"
        type="password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />
      <Typography variant="caption">
        Password must include uppercase, lowercase, number, special character
        and 6+ characters.
      </Typography>

      <CommonInput
        label="Confirm Password"
        name="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e: any) => setConfirmPassword(e.target.value)}
      />

      <CommonButton
        label="Reset Password"
        onClick={handleReset}
        sx={{ mt: 2 }}
      />

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
