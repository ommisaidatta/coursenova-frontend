import React from "react";
import TextField from "@mui/material/TextField";
import { SxProps, Theme } from "@mui/material/styles";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

interface CommonInputProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
  InputProps?: any;
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  rows = 1,
  error = false,
  helperText,
  InputProps,
  sx,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  return (
    <TextField
      label={label}
      name={name}
      type={isPassword ? (showPassword ? "text" : "password") : type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      multiline={multiline}
      rows={rows}
      error={error}
      helperText={helperText}
      fullWidth
      sx={sx}
      InputProps={{
        ...InputProps,
        ...(isPassword && {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }),
      }}
    />
  );
};

export default CommonInput;
