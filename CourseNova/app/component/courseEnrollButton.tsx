"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  course: any;
  onConfirm: () => void;
}

export default function CourseEnroll({
  open,
  onClose,
  course,
  onConfirm,
}: Props) {
  if (!course) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirm Enrollment</DialogTitle>

      <DialogContent>
        <Typography fontWeight={600}>{course.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Duration: {course.duration}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Level: {course.level}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Confirm Enroll
        </Button>
      </DialogActions>
    </Dialog>
  );
}
