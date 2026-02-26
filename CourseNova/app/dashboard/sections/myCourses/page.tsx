"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LessonList from "./lessonList";
import LessonContent from "./lessonContent";
import AddLessonDialog from "@/app/component/addLessonDialog";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

function CourseLessonsContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? undefined;

  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // const [dialogOpen, setDialogOpen] = useState(false);
  // const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  // const [editLesson, setEditLesson] = useState<any>(null);

  const fetchLessons = async () => {
    if (!courseId) return;
    const res = await fetch(
      `http://localhost:5000/api/lesson/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    const data = await res.json();
    const lessonsData = Array.isArray(data) ? data : [];
    setLessons(lessonsData);

    setActiveLesson((prev: any) => {
      const stillExists = lessonsData.some((l: any) => l._id === prev?._id);
      if (!stillExists) return lessonsData[0] || null;
      if (!prev && lessonsData.length > 0) return lessonsData[0];
      const updated = lessonsData.find((l: any) => l._id === prev?._id);
      return updated ?? prev;
    });
  };

  const fetchProgress = async () => {
    if (!courseId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/progress/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) {
        setCompletedLessons([]);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setCompletedLessons([]);
        return;
      }

      const data = await res.json();
      const completed = data.completedLessons || [];
      setCompletedLessons(completed);
    } catch (err) {
      console.error("Progress fetch failed", err);
      setCompletedLessons([]);
    }
  };

  useEffect(() => {
    if (courseId) fetchLessons();
  }, [courseId]);

  useEffect(() => {
    if (lessons.length) {
      fetchProgress();
    }
  }, [lessons]);

  // const openCreateDialog = () => {
  //   setDialogMode("create");
  //   setEditLesson(null);
  //   setDialogOpen(true);
  // };
  //
  // const openEditDialog = (lesson: any) => {
  //   setDialogMode("edit");
  //   setEditLesson(lesson);
  //   setDialogOpen(true);
  // };

  if (!courseId) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          p: 4,
        }}
      >
        <Typography color="text.secondary">
          No course selected. Go to My Courses and click &quot;Continue
          Learning&quot; on a course.
        </Typography>
      </Box>
    );
  }

  const handleLessonComplete = (
    _lessonId?: string,
    completedFromApi?: string[],
  ) => {
    if (completedFromApi != null) {
      setCompletedLessons(completedFromApi);
    } else {
      fetchProgress();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          width: 300,
          minWidth: 280,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            pt: 1,
            px: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            component={Link}
            href="/dashboard?section=my-courses"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Back
          </Button>
          {/* Add lesson button disabled on student side
          <IconButton
            onClick={openCreateDialog}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "primary.main",
              color: "white",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: 2,
              },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </IconButton>
          */}
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <LessonList
            lessons={lessons}
            activeLesson={activeLesson}
            completedLessons={completedLessons}
            onSelect={setActiveLesson}
            onRefresh={fetchLessons}
            courseId={courseId}
            // onOpenEdit={openEditDialog}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <LessonContent
          lesson={activeLesson}
          lessons={lessons}
          activeLesson={activeLesson}
          onSelect={setActiveLesson}
          // onEdit={openEditDialog}
          courseId={courseId}
          onLessonComplete={handleLessonComplete}
          completedLessons={completedLessons}
        />
      </Box>

      {/* Lesson create/edit dialog disabled on student side
      <AddLessonDialog
        open={dialogOpen}
        mode={dialogMode}
        lesson={editLesson}
        courseId={courseId}
        lessonsCount={lessons.length}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchLessons}
      />
      */}
    </Box>
  );
}

export default function CourseLessonsPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <CourseLessonsContent />
    </Suspense>
  );
}
