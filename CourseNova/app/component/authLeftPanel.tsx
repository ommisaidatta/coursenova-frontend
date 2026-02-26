"use client";

import { Box, Typography } from "@mui/material";

export default function AuthLeftPanel() {
  return (
    <Box
      sx={{
        height: { xs: "auto", md: "100vh" },
        minHeight: { xs: "auto", md: "100vh" },
        background: "#eef2ff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 4,
        position: "relative",
      }}
    >
      <Box sx={{ width: "80%", mb: 3 }}>
        <img
          src="/laptopImg.jpg"
          alt="learning"
          style={{ width: "100%", maxWidth: 400 }}
        />
      </Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        position="absolute"
        sx={{
          maxWidth: { xs: 300, md: 400 },
          fontSize: { xs: "1.5rem", md: "2rem" },
          mb: { xs: 20, lg: 30 },
          ml: { xs: 25, sm: 40, lg: 35 },
          p: 2,
        }}
      >
        Start Your Learning Journey Today
      </Typography>

      <Typography
        variant="h5"
        color="secondary"
        sx={{
          fontWeight: 700,
          maxWidth: { xs: 300, md: 420 },
          fontSize: { xs: "1rem", md: "1.2rem" },
        }}
      >
        Build real skills and shape your future with confidence.
      </Typography>
    </Box>
  );
}
