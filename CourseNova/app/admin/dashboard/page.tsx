"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
  useMediaQuery,
  useTheme,
  AppBar,
  MenuItem,
} from "@mui/material";
import {
  Logout,
  PersonAdd,
  AddCircle,
  People,
  MenuBook,
  WorkspacePremium,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School,
} from "@mui/icons-material";
import axiosInstance from "@/app/utils/axiosInstance";
import CourseFormDialog from "@/app/component/courseFormDialog";
import AddLessonDialog from "@/app/component/addLessonDialog";

type UserRow = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
};

type CourseRow = {
  _id: string;
  title: string;
  category?: string;
  level?: string;
  duration?: string;
};

type LessonRow = {
  _id: string;
  title: string;
  order: number;
  course: string;
  contentBlocks?: any[];
};

type AdminDashboardProps = {
  initialTab?: number;
};

export function AdminDashboardPageInner({
  initialTab = 0,
}: AdminDashboardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState(initialTab);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalCertificates: 0,
  });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(0);
  const [coursesPage, setCoursesPage] = useState(0);
  const [lessonsPage, setLessonsPage] = useState(0);
  const rowsPerPage = 10;

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [editLesson, setEditLesson] = useState<LessonRow | null>(null);
  const [userForm, setUserForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    // password: "",
    role: "student",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard");
      setStats({
        totalUsers: res.data.totalUsers ?? 0,
        totalCourses: res.data.totalCourses ?? 0,
        totalCertificates: res.data.totalCertificates ?? 0,
      });
    } catch (e) {
      setSnack({
        open: true,
        message: "Failed to load dashboard stats",
        severity: "error",
      });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data.users ?? []);
    } catch (e) {
      setSnack({
        open: true,
        message: "Failed to load users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true); // Changed from setLoading
      const res = await axiosInstance.get("/admin/courses");
      setCourses(res.data.courses ?? []);
    } catch (e) {
      setSnack({
        open: true,
        message: "Failed to load courses",
        severity: "error",
      });
    } finally {
      setCoursesLoading(false); // Changed from setLoading
    }
  }, []);

  const fetchLessons = useCallback(async (courseId: string) => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    try {
      setLessonsLoading(true);
      const res = await axiosInstance.get(`/lesson/course/${courseId}`);
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSnack({
        open: true,
        message: "Failed to load lessons",
        severity: "error",
      });
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return router.replace("/");
    if (role !== "admin") return router.replace("/dashboard");

    setChecking(false);
  }, [router]);

  useEffect(() => {
    if (checking) return;
    fetchDashboard();
  }, [checking, fetchDashboard]);

  useEffect(() => {
    if (checking) return;
    if (tab === 0) {
      fetchUsers();
    } else if (tab === 1 || tab === 2) {
      // Load courses for BOTH tabs
      fetchCourses();
    }
  }, [checking, tab, fetchUsers, fetchCourses]);

  useEffect(() => {
    if (tab === 2 && courses.length === 0 && !coursesLoading) {
      fetchCourses();
    }
  }, [tab, courses.length, coursesLoading, fetchCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse._id);
    } else {
      setLessons([]);
    }
  }, [selectedCourse, fetchLessons]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/students/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/");
  };

  const handleAddUser = async () => {
    if (
      !userForm.firstname?.trim() ||
      !userForm.lastname?.trim() ||
      !userForm.email?.trim() ||
      // !userForm.password ||
      !userForm.role
    ) {
      setSnack({
        open: true,
        message: "All fields are required",
        severity: "error",
      });
      return;
    }
    try {
      await axiosInstance.post("/admin/users", {
        firstname: userForm.firstname.trim(),
        lastname: userForm.lastname.trim(),
        email: userForm.email.trim(),
        // password: userForm.password,
        role: userForm.role,
      });
      setSnack({
        open: true,
        message: "User created successfully",
        severity: "success",
      });
      setAddUserOpen(false);
      setUserForm({
        firstname: "",
        lastname: "",
        email: "",
        // password: "",
        role: "student",
      });
      fetchUsers();
      fetchDashboard();
    } catch (e: any) {
      setSnack({
        open: true,
        message: e.response?.data?.message || "Failed to create user",
        severity: "error",
      });
    }
  };

  const handleCreateCourse = async (data: {
    title: string;
    category?: string;
    duration: string;
    level?: string;
  }) => {
    try {
      await axiosInstance.post("/admin/courses", {
        title: data.title.trim(),
        category: data.category || "",
        duration: data.duration.trim(),
        level: data.level || "Beginner",
      });
      setSnack({
        open: true,
        message: "Course created successfully",
        severity: "success",
      });
      setAddCourseOpen(false);
      fetchCourses();
      fetchDashboard();
    } catch (e: any) {
      setSnack({
        open: true,
        message: e.response?.data?.message || "Failed to create course",
        severity: "error",
      });
    }
  };

  const handleUpdateCourse = async (data: {
    title: string;
    category?: string;
    duration: string;
    level?: string;
  }) => {
    if (!editCourse) return;
    try {
      await axiosInstance.put(`/admin/courses/${editCourse._id}`, {
        title: data.title.trim(),
        category: data.category || "",
        duration: data.duration.trim(),
        level: data.level || "Beginner",
      });
      setSnack({
        open: true,
        message: "Course updated successfully",
        severity: "success",
      });
      setEditCourse(null);
      fetchCourses();
    } catch (e: any) {
      setSnack({
        open: true,
        message: e.response?.data?.message || "Failed to update course",
        severity: "error",
      });
    }
  };

  const handleDeleteCourse = async (course: CourseRow) => {
    if (!confirm(`Delete course "${course.title}"?`)) return;
    try {
      await axiosInstance.delete(`/admin/courses/${course._id}`);
      setSnack({ open: true, message: "Course deleted", severity: "success" });
      fetchCourses();
      fetchDashboard();
      if (selectedCourse?._id === course._id) {
        setSelectedCourse(null);
      }
    } catch (e: any) {
      setSnack({
        open: true,
        message: e.response?.data?.message || "Failed to delete course",
        severity: "error",
      });
    }
  };

  const handleDeleteLesson = async (lesson: LessonRow) => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await axiosInstance.delete(`/lesson/${lesson._id}`);
      setSnack({ open: true, message: "Lesson deleted", severity: "success" });
      if (selectedCourse) {
        fetchLessons(selectedCourse._id);
      }
    } catch (e: any) {
      setSnack({
        open: true,
        message: e.response?.data?.message || "Failed to delete lesson",
        severity: "error",
      });
    }
  };

  const handleLessonSuccess = () => {
    if (selectedCourse) {
      fetchLessons(selectedCourse._id);
    }
  };

  if (checking) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const statsCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <People />,
      color: "primary" as const,
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: <MenuBook />,
      color: "success" as const,
    },
    {
      label: "Certificates Issued",
      value: stats.totalCertificates,
      icon: <WorkspacePremium />,
      color: "warning" as const,
    },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#e8f2fb",
          color: "#000",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            m: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.3rem",
                sm: "2rem",
              },
            }}
          >
            Admin Dashboard
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout fontSize="small" />}
            onClick={handleLogout}
            size="small"
            sx={{
              height: 36,
              minWidth: 90,
              px: 2,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: "white",
              color: "#dc2626",
              borderColor: "white",
              "&:hover": {
                bgcolor: "#fee2e2",
                borderColor: "#fee2e2",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </AppBar>

      <Box
        sx={{
          p: { xs: 2, md: 4 },
          minHeight: "100vh",
          bgcolor:
            "linear-gradient(135deg, #0f172a 0%, #020617 60%, #020617 100%)",
          mt: 10,
        }}
      >
        <Grid container spacing={3} mb={4}>
          {statsCards.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 5px 15px rgba(15,23,42,0.55)",
                  background:
                    index === 0
                      ? "linear-gradient(135deg, #0ea5e9, #2563eb)"
                      : index === 1
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "primary.contrastText",
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ opacity: 0.9, letterSpacing: 0.6 }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ mt: 1, lineHeight: 1.1 }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(15,23,42,0.18)",
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper
          sx={{
            borderRadius: 3,
            bgcolor: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              const next =
                v === 0
                  ? "user-management"
                  : v === 1
                    ? "course-management"
                    : "lesson-management";
              router.replace(`/admin/dashboard/${next}`);
            }}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                color: "#64748b",
                fontSize: "0.95rem",
              },
              "& .Mui-selected": {
                color: "#0f172a",
              },
              "& .MuiTabs-indicator": {
                display: "flex",
                justifyContent: "center",
                backgroundColor: "transparent",
              },
              "& .MuiTabs-indicatorSpan": {
                maxWidth: "30%",
                width: "100%",
                height: 2,
                borderRadius: 2,
                backgroundColor: "#3b82f6",
              },
            }}
            TabIndicatorProps={{
              children: <span className="MuiTabs-indicatorSpan" />,
            }}
          >
            <Tab label={isMobile ? "User" : "Users Management"} />
            <Tab label={isMobile ? "Courses" : "Courses Management"} />
            <Tab label={isMobile ? "Lessons" : "Lesson Management"} />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setAddUserOpen(true)}
                >
                  Add User
                </Button>
              </Box>

              {loading ? (
                <Typography color="text.secondary">Loading users...</Typography>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead
                        sx={{
                          "& .MuiTableCell-head": {
                            backgroundColor: "#f8fafc",
                            fontWeight: 700,
                            color: "#334155",
                            borderBottom: "2px solid #e2e8f0",
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            First name
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            Last name
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            Email
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            Role
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users
                          .slice(
                            usersPage * rowsPerPage,
                            usersPage * rowsPerPage + rowsPerPage,
                          )
                          .map((user) => (
                            <TableRow key={user._id} hover>
                              <TableCell>{user.firstname}</TableCell>
                              <TableCell>{user.lastname}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={user.role || "student"}
                                  size="small"
                                  color="primary"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={users.length}
                    page={usersPage}
                    onPageChange={(_, newPage) => setUsersPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10]}
                  />
                </>
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Courses
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddCircle />}
                  onClick={() => setAddCourseOpen(true)}
                >
                  Add Course
                </Button>
              </Box>

              {coursesLoading ? (
                <Typography color="text.secondary">
                  Loading courses...
                </Typography>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead
                        sx={{
                          "& .MuiTableCell-head": {
                            backgroundColor: "#f8fafc",
                            fontWeight: 700,
                            color: "#334155",
                            borderBottom: "2px solid #e2e8f0",
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Duration
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {courses
                          .slice(
                            coursesPage * rowsPerPage,
                            coursesPage * rowsPerPage + rowsPerPage,
                          )
                          .map((course) => (
                            <TableRow key={course._id} hover>
                              <TableCell>{course.title}</TableCell>
                              <TableCell>{course.category || "—"}</TableCell>
                              <TableCell>
                                {course.level || "Beginner"}
                              </TableCell>
                              <TableCell>{course.duration || "—"}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditCourse(course)}
                                  title="Edit"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteCourse(course)}
                                  title="Delete"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={courses.length}
                    page={coursesPage}
                    onPageChange={(_, newPage) => setCoursesPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10]}
                  />
                </>
              )}
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Lesson Management
                </Typography>

                {/* Course Selector */}
                <Autocomplete
                  options={courses}
                  getOptionLabel={(option) => option.title || ""}
                  value={selectedCourse}
                  onChange={(_, newValue) => {
                    setSelectedCourse(newValue);
                    setLessonsPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Course"
                      placeholder="Search and select a course..."
                      fullWidth
                      variant="outlined"
                    />
                  )}
                  sx={{ mb: 3 }}
                  noOptionsText={
                    coursesLoading ? "Loading courses..." : "No courses found"
                  }
                  loading={coursesLoading || courses.length === 0}
                />

                {selectedCourse && (
                  <>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Managing lessons for:{" "}
                        <strong>{selectedCourse.title}</strong>
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircle />}
                        onClick={() => setAddLessonOpen(true)}
                        sx={{ minWidth: { xs: "100%", sm: "auto" } }}
                      >
                        Add Lesson
                      </Button>
                    </Box>

                    {lessonsLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : lessons.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <School
                          sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="body1" color="text.secondary">
                          No lessons found for this course
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                        >
                          Click "Add Lesson" to create the first lesson
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <TableContainer>
                          <Table>
                            <TableHead
                              sx={{
                                "& .MuiTableCell-head": {
                                  backgroundColor: "#f8fafc",
                                  fontWeight: 700,
                                  color: "#334155",
                                  borderBottom: "2px solid #e2e8f0",
                                },
                              }}
                            >
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Order
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Title
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 600 }}
                                  align="right"
                                >
                                  Actions
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {lessons
                                .slice(
                                  lessonsPage * rowsPerPage,
                                  lessonsPage * rowsPerPage + rowsPerPage,
                                )
                                .map((lesson) => (
                                  <TableRow key={lesson._id} hover>
                                    <TableCell>
                                      <Chip
                                        label={lesson.order}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {lesson.title}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <IconButton
                                        size="small"
                                        onClick={() => setEditLesson(lesson)}
                                        title="Edit"
                                        sx={{ mr: 1 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleDeleteLesson(lesson)
                                        }
                                        title="Delete"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          component="div"
                          count={lessons.length}
                          page={lessonsPage}
                          onPageChange={(_, newPage) => setLessonsPage(newPage)}
                          rowsPerPage={rowsPerPage}
                          rowsPerPageOptions={[10]}
                        />
                      </>
                    )}
                  </>
                )}

                {!selectedCourse && (
                  <Box textAlign="center" py={6}>
                    <School
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Select a Course
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a course from the dropdown above to manage its
                      lessons
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Add User Dialog */}
        <Dialog
          open={addUserOpen}
          onClose={() => setAddUserOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add User</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="First name"
                value={userForm.firstname}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, firstname: e.target.value }))
                }
                fullWidth
                required
              />
              <TextField
                label="Last name"
                value={userForm.lastname}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, lastname: e.target.value }))
                }
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, email: e.target.value }))
                }
                fullWidth
                required
              />
              <TextField
                select
                label="Role"
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, role: e.target.value }))
                }
                fullWidth
                required
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              {/* <TextField
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, password: e.target.value }))
                }
                fullWidth
                required
              /> */}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddUser}>
              Add User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add / Edit Course Dialog */}
        <CourseFormDialog
          open={addCourseOpen || !!editCourse}
          mode={editCourse ? "edit" : "create"}
          course={editCourse || undefined}
          onClose={() => {
            setAddCourseOpen(false);
            setEditCourse(null);
          }}
          onSubmit={(data) => {
            if (editCourse) handleUpdateCourse(data);
            else handleCreateCourse(data);
          }}
        />

        {/* Add / Edit Lesson Dialog */}
        {selectedCourse && (
          <AddLessonDialog
            open={addLessonOpen || !!editLesson}
            mode={editLesson ? "edit" : "create"}
            lesson={editLesson || undefined}
            courseId={selectedCourse._id}
            lessonsCount={lessons.length}
            onClose={() => {
              setAddLessonOpen(false);
              setEditLesson(null);
            }}
            onSuccess={handleLessonSuccess}
          />
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={6000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

export default function AdminDashboardRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard/user-management");
  }, [router]);

  return null;
}
