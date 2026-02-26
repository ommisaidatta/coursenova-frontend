"use client";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import CommonInput from "../component/inputfield";
import CommonButton from "../component/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async () => {
    await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    alert("Reset link sent");
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h5" mb={2}>
        Forgot Password
      </Typography>

      <CommonInput
        label="Email"
        name="Email"
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
      />

      <CommonButton label="Send Reset Link" onClick={submit} sx={{ mt: 2 }} />
    </Box>
  );
}
