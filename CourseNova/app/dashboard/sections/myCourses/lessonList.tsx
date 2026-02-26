"use client";

import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "@/app/component/confirmDeleteDialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LessonList({
  lessons,
  activeLesson,
  completedLessons = [],
  onSelect,
  onRefresh,
  onOpenEdit,
}: any) {
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // const handleDeleteClick = (lesson: any) => {
  //   setLessonToDelete(lesson);
  //   setDeleteDialogOpen(true);
  // };
  //
  // const confirmDelete = async () => {
  //   if (!lessonToDelete) return;
  //   await fetch(`http://localhost:5000/api/lesson/${lessonToDelete._id}`, {
  //     method: "DELETE",
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem("token")}`,
  //     },
  //   });
  //
  //   setDeleteDialogOpen(false);
  //   setLessonToDelete(null);
  //   onRefresh();
  // };

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "#fafafa",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          mt: 3,
        }}
      >
        <List disablePadding>
          {lessons.map((lesson: any) => {
            const isCompleted = completedLessons.includes(lesson._id);
            return (
              <ListItem key={lesson._id} disablePadding>
                <ListItemButton
                  selected={activeLesson?._id === lesson._id}
                  onClick={() => onSelect(lesson)}
                  sx={{
                    py: 1.25,
                    px: 2,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      "& .MuiTypography-root": {
                        color: "inherit",
                      },
                    },
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon
                      sx={{
                        fontSize: 20,
                        color: "success.main",
                        mr: 1,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 28, mr: 1, flexShrink: 0 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontWeight: isCompleted ? 600 : 500,
                      color: isCompleted ? "success.main" : "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lesson.order}. {lesson.title}
                  </Typography>

                  {/* Lesson edit/delete actions are disabled on student side
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{ display: "flex", gap: 0, ml: 0.5 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onOpenEdit(lesson)}
                      sx={{
                        p: 0.5,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(lesson)}
                      sx={{
                        p: 0.5,
                        color: "inherit",
                        opacity: 0.9,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  */}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {/* Delete confirmation disabled on student side
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title={lessonToDelete?.title || ""}
        itemLabel="lesson"
        onConfirm={confirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setLessonToDelete(null);
        }}
      />
      */}
    </Box>
  );
}
