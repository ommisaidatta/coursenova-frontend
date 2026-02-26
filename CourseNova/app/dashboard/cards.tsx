"use client";

import { Box, Grid, Typography } from "@mui/material";

export default function DashboardCards({
  enrolled,
  inProgress,
  completed,
}: {
  enrolled: number;
  inProgress: number;
  completed: number;
}) {
  const cards = [
    { title: "Enrolled Courses", value: enrolled, color: "#2563eb" },
    { title: "In Progress", value: inProgress, color: "#f59e0b" },
    { title: "Completed", value: completed, color: "#16a34a" },
  ];
  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 4, md: 4 }}>
          <Box
            sx={{
              position: "relative",
              p: { xs: 1, sm: 2 },
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              borderLeft: `6px solid ${card.color}`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2rem" },
                fontWeight: 700,
                mt: 1,
              }}
            >
              {card.value}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
