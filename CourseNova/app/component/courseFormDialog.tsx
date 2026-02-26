"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  course?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CourseFormDialog({
  open,
  mode,
  course,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    duration: "",
    level: "Beginner",
  });

  useEffect(() => {
    if (mode === "edit" && course) {
      setFormData({
        title: course.title || "",
        category: course.category || "",
        duration: course.duration || "",
        level: course.level || "Beginner",
      });
    }

    if (mode === "create") {
      setFormData({
        title: "",
        category: "",
        duration: "",
        level: "Beginner",
      });
    }
  }, [mode, course]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" ? "Create Course" : "Edit Course"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Duration (e.g. 2 weeks)"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            select
            label="Level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
