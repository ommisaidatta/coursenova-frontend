"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Rating,
} from "@mui/material";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle?: string;
  existingRating?: number;
  existingReview?: string;
  onSuccess?: (payload: { rating: number; review: string }) => void;
}

export default function RatingDialog({
  open,
  onClose,
  courseId,
  courseTitle,
  existingRating = 0,
  existingReview = "",
  onSuccess,
}: Props) {
  const [rating, setRating] = useState<number | null>(existingRating);
  const [review, setReview] = useState(existingReview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load existing rating when dialog opens
  useEffect(() => {
    if (open) {
      setRating(existingRating);
      setReview(existingReview);
      setError("");
    }
  }, [open, existingRating, existingReview]);

  // Submit Rating
  const handleSubmit = async () => {
    if (!courseId || !rating) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          courseId,
          rating,
          review,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to submit rating");
        return;
      }

      onSuccess?.({ rating, review });
      onClose();
    } catch (error) {
      console.error("Rating failed", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {existingRating ? "Edit your rating" : "Rate this course"}
        {courseTitle ? ` — ${courseTitle}` : ""}
      </DialogTitle>

      <DialogContent>
        <Box mt={1}>
          <Typography mb={1} fontWeight={700}>
            Your rating
          </Typography>

          <Rating
            value={rating}
            precision={0.5}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Write a review (optional)"
          sx={{ mt: 3 }}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!courseId || !rating || loading}
        >
          {loading ? "Saving..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
