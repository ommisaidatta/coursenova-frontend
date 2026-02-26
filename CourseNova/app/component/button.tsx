import React from "react";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/material/styles";

interface CommonButtonProps {
  label: string;
  variant?: "text" | "contained" | "outlined";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  size?: "small" | "medium" | "large";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  label,
  variant = "contained",
  color = "primary",
  size = "medium",
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
  sx,
  startIcon,
  endIcon,
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      sx={sx}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {label}
    </Button>
  );
};

export default CommonButton;
