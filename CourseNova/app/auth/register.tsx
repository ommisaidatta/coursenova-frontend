"use client";

import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useState } from "react";
import CommonButton from "../component/button";
import CommonToast from "../component/alertToast";
import CommonInput from "../component/inputfield";

export default function RegisterForm() {
  const initialForm = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "",
  };

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "",
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [errors, setErrors] = useState<any>({});

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // password validation (clean & scalable)
  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 6) errors.push("Min 6 characters");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase");
    if (!/[0-9]/.test(password)) errors.push("1 number");
    if (!/[!@#$%^&*_]/.test(password)) errors.push("1 special character");

    return errors;
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.firstname.trim())
      newErrors.firstname = "FirstName is required";

    if (!formData.lastname.trim()) newErrors.lastname = "LastName is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const pwdErrors = validatePassword(formData.password);
      if (pwdErrors.length > 0) {
        newErrors.password = pwdErrors.join(", ");
      }
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.address) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted!");

    if (!validate()) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/students/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setToast({
          open: true,
          message: data.message,
          severity: "success",
        });

        setFormData(initialForm);
      } else {
        setToast({
          open: true,
          message: data.message || "Something went wrong",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      setToast({
        open: true,
        message: "Server error",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
        Register Now
      </Typography>

      {/* <form onSubmit={handleSubmit}> */}
      <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
        <CommonInput
          required
          label="FirstName"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          error={!!errors.firstname}
          helperText={errors.firstname}
        />

        <CommonInput
          required
          label="LastName"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          error={!!errors.lastname}
          helperText={errors.lastname}
        />

        <CommonInput
          required
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        <CommonInput
          required
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
        />

        <CommonInput
          required
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              setFormData({ ...formData, phone: value });
            }
          }}
          error={!!errors.phone}
          helperText={errors.phone}
        />

        <CommonInput
          required
          label="Address"
          name="address"
          multiline
          rows={2}
          value={formData.address}
          onChange={handleChange}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              minWidth: { sm: "80px" },
              fontWeight: 500,
              mt: 1,
            }}
          >
            Gender:
          </Typography>

          <RadioGroup
            name="gender"
            row
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </Box>

        <CommonButton label="Register" type="submit" fullWidth />
      </Box>
      {/* </form> */}

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
