"use client";

import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
  itemLabel?: string; // e.g. "Lesson" or "Course"
}

export default function ConfirmDeleteDialog({
  open,
  title,
  onConfirm,
  onClose,
  itemLabel = "item",
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete {itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)}</DialogTitle>

      <Typography sx={{ px: 3, py: 1 }}>
        Are you sure you want to delete <b>{title}</b>?
      </Typography>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
