"use client";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { key: "courses", label: "All Courses", icon: <MenuBookIcon /> },
  { key: "my-courses", label: "My Courses", icon: <SchoolIcon /> },
  {
    key: "certificates",
    label: "My Certificates",
    icon: <CardMembershipIcon />,
  },
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
];

export default function Sidebar({
  active,
  onChange,
  onLogout,
}: {
  active: string;
  onChange: (val: string) => void;
  onLogout: () => void;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 2 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: 280,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="Coursenova Logo"
          sx={{
            width: { xs: 120, md: 180 },
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = active === item.key;

          return (
            <ListItemButton
              key={item.key}
              onClick={() => onChange(item.key)}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: isActive ? "#2563eb" : "transparent",
                color: isActive ? "#fff" : "#000",
                "&:hover": {
                  bgcolor: isActive ? "#2563eb" : "#e2e8f0",
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? "#fff" : "#475569" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Button
        startIcon={<LogoutIcon />}
        variant="outlined"
        fullWidth
        onClick={onLogout}
      >
        Logout
      </Button>
    </Box>
  );
}
