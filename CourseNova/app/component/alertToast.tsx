"use client";

import { Snackbar, Alert } from "@mui/material";

type ToastProps = {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "info" | "warning";
  onClose: () => void;
};

export default function CommonToast({
  open,
  message,
  severity = "info",
  onClose,
}: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          backgroundColor: "#eef2ffff",
          color: "#000000ff",
          fontWeight: 500,
          border: "solid 1px rgba(209, 240, 53, 1)",
          boxShadow: "0px 2px 13px rgba(0,0,0,0.3)",
          borderRadius: "12px",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
