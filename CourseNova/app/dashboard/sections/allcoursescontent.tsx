"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Rating,
} from "@mui/material";
import CommonToast from "@/app/component/alertToast";
import { useEffect, useState } from "react";
import CourseEnroll from "@/app/component/courseEnrollButton";
import { useEnrollment } from "@/app/context/enrollmentContext";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import CourseFormDialog from "@/app/component/courseFormDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteDialog from "@/app/component/confirmDeleteDialog";
import axiosInstance from "@/app/utils/axiosInstance";

interface Course {
  _id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  averageRating?: number;
  totalReviews?: number;
}

interface Filters {
  level?: string;
  category?: string;
  enrollment?: string; // "enrolled" | "unenrolled" | ""
  rating?: string; // min rating: "" | "4" | "3" | "2" | "1"
}

interface Props {
  searchText: string;
  filters: Filters;
}

export default function AllCoursesContent({ searchText, filters }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editCourse, setEditCourse] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCourse, setDeleteCourse] = useState<any>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const { refreshEnrollments, refreshKey } = useEnrollment();

  useEffect(() => {
    axiosInstance
      .get("/courses")
      .then((res) => {
        const data = res.data;
        setCourses(Array.isArray(data) ? data : (data?.courses ?? []));
      })
      .catch((err) => {
        console.error("Error fetching courses", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/enroll/my")
      .then((res) => {
        const data = res.data;
        const ids = (Array.isArray(data) ? data : []).map(
          (enroll: any) => enroll.course._id,
        );
        setEnrolledCourseIds(ids);
      })
      .catch((err) => {
        console.error("Failed to fetch enrollments", err);
      });
  }, [refreshKey]);

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setOpen(true);
  };

  const handleConfirmEnroll = async () => {
    try {
      await axiosInstance.post("/enroll", {
        courseId: selectedCourse._id,
      });

      setToast({
        open: true,
        message: "Enrolled successfully",
        severity: "success",
      });

      setEnrolledCourseIds((prev) => [...prev, selectedCourse._id]);

      refreshEnrollments();
      setOpen(false);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.response?.data?.message || "Enrollment failed",
        severity: "error",
      });
    }
  };

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  const fetchCourses = () => {
    axiosInstance.get("/courses").then((res) => {
      const data = res.data;
      setCourses(Array.isArray(data) ? data : (data?.courses ?? []));
    });
  };

  const handleCreateCourse = async (data: any) => {
    try {
      await axiosInstance.post("/admin/courses", data);
      setDialogOpen(false);
      fetchCourses();
      setToast({
        open: true,
        message: "Course created successfully",
        severity: "success",
      });
    } catch (_) {}
  };

  const confirmDeleteCourse = async () => {
    try {
      await axiosInstance.delete(`/admin/courses/${deleteCourse._id}`);
      setToast({
        open: true,
        message: "Course deleted successfully",
        severity: "success",
      });
      setDeleteOpen(false);
      setDeleteCourse(null);
      fetchCourses();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const handleCourseSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        await axiosInstance.post("/admin/courses", data);
      } else {
        await axiosInstance.put(`/admin/courses/${editCourse._id}`, data);
      }
      setDialogOpen(false);
      fetchCourses();
      setToast({
        open: true,
        message:
          mode === "create"
            ? "Course created successfully"
            : "Course updated successfully",
        severity: "success",
      });
    } catch (_) {}
  };

  const filteredCourses = courses.filter((course) => {
    const isEnrolled = enrolledCourseIds.includes(course._id);

    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesLevel = !filters?.level || course.level === filters.level;

    const matchesCategory =
      !filters?.category || course.category === filters.category;

    const matchesEnrollment =
      !filters?.enrollment ||
      (filters.enrollment === "enrolled" && isEnrolled) ||
      (filters.enrollment === "unenrolled" && !isEnrolled);

    const minRating = filters?.rating ? Number(filters.rating) : null;
    const courseAvg = Number(course.averageRating ?? 0);
    const matchesRating = !minRating || courseAvg >= minRating;

    return (
      matchesSearch &&
      matchesLevel &&
      matchesCategory &&
      matchesEnrollment &&
      matchesRating
    );
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          All Courses
        </Typography>

        {/* <IconButton
          onClick={() => {
            setMode("create");
            setDialogOpen(true);
          }}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: 46,
            height: 46,
            boxShadow: 3,
            "&:hover": {
              bgcolor: "primary.dark",
              transform: "scale(1.1)",
              boxShadow: 4,
            },
            transition: "all 0.2s ease",
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </IconButton> */}
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {filteredCourses.length === 0 && (
          <Typography>No courses found</Typography>
        )}

        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.includes(course._id);
          return (
            <Grid key={course._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  transition: "all 0.25s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      fontSize="1.1rem"
                      fontWeight={800}
                      sx={{
                        lineHeight: 1.3,
                      }}
                    >
                      {course.title}
                    </Typography>

                    {/* <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setMode("edit");
                          setEditCourse(course);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeleteCourse(course);
                          setDeleteOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box> */}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {course.category}
                    </Typography>
                    <Box display={"flex"} gap={1}>
                      <Chip
                        label={course.level}
                        size="small"
                        sx={{
                          bgcolor: "#f1f5f9",
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        label={course.duration}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#e2e8f0",
                        }}
                      />
                    </Box>
                  </Box>

                  {/*  Average rating + review count */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Rating
                        value={Number(course.averageRating ?? 0)}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography fontWeight={700}>
                        {Number(course.averageRating ?? 0).toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        (
                        {new Intl.NumberFormat().format(
                          Number(course.totalReviews ?? 0),
                        )}
                        )
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant={isEnrolled ? "outlined" : "contained"}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,

                        "&:hover": {
                          transform: "translateY(-1px)",
                        },
                      }}
                      disabled={isEnrolled}
                      onClick={() => handleEnrollClick(course)}
                    >
                      {isEnrolled ? "Enrolled" : "Enroll"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <CourseEnroll
        open={open}
        course={selectedCourse}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmEnroll}
      />

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <CourseFormDialog
        open={dialogOpen}
        mode={mode}
        course={editCourse}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCourseSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title={deleteCourse?.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteCourse}
      />
    </Box>
  );
}
