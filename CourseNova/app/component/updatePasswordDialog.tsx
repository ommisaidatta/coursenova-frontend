"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState, ChangeEvent } from "react";
import CommonToast from "@/app/component/alertToast";

interface Props {
  open: boolean;
  onClose: () => void;
}

type PasswordField = "old" | "new" | "confirm";

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordDialog({ open, onClose }: Props) {
  const [form, setForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<
    Record<PasswordField, boolean>
  >({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (field: PasswordField) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setToast({
        open: true,
        message: "All fields are required",
        severity: "error",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setToast({
        open: true,
        message: "New passwords do not match",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/changepassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setToast({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onClose();
    } catch (err) {
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Password update failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Change Password</DialogTitle>

        <DialogContent>
          <TextField
            margin="dense"
            label="Old Password"
            name="oldPassword"
            type={showPassword.old ? "text" : "password"}
            fullWidth
            value={form.oldPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePassword("old")} edge="end">
                    {showPassword.old ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="dense"
            label="New Password"
            name="newPassword"
            type={showPassword.new ? "text" : "password"}
            fullWidth
            value={form.newPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePassword("new")} edge="end">
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword.confirm ? "text" : "password"}
            fullWidth
            value={form.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePassword("confirm")}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
}
