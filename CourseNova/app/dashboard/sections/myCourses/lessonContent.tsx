"use client";

import { useRef, useCallback } from "react";
import { Box, Typography, Button, Divider, Paper, Link } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";

type VideoType = {
  title: string;
  url: string;
};

type CodeType = {
  language: string;
  code: string;
};

export default function LessonContent({
  lesson,
  lessons,
  activeLesson,
  onSelect,
  onEdit,
  courseId,
  onLessonComplete,
  completedLessons = [],
}: any) {
  const contentRef = useRef<HTMLDivElement>(null);

  const currentIndex =
    lessons?.findIndex((l: any) => l._id === activeLesson?._id) ?? -1;

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < (lessons?.length ?? 0) - 1
      ? lessons[currentIndex + 1]
      : null;

  const isCurrentCompleted = activeLesson
    ? completedLessons.includes(activeLesson._id)
    : false;

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }

    return url;
  };

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (completedLessons.includes(lessonId)) return;

      try {
        const res = await fetch("http://localhost:5000/api/progress/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ courseId, lessonId }),
        });

        if (res.ok) {
          const data = await res.json();
          const completed = data.completedLessons || [];
          onLessonComplete?.(lessonId, completed);
        }
      } catch (err) {
        console.error("Progress update failed", err);
      }
    },
    [courseId, completedLessons, onLessonComplete],
  );

  const handleNext = useCallback(() => {
    nextLesson && onSelect(nextLesson);
  }, [nextLesson, onSelect]);

  if (!lesson) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          backgroundColor: "#fafafa",
        }}
      >
        <Typography>Select a lesson from the list</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            {lesson.title}
          </Typography>

          {/* Lesson edit disabled on student side
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit?.(lesson)}
            sx={{ textTransform: "none" }}
          >
            Edit
          </Button>
          */}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
          lesson.contentBlocks.map((block: any, index: number) => {
            if (block.type === "text" && block.text) {
              return (
                <Box key={index} mb={3}>
                  <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
                    {block.text}
                  </Typography>
                </Box>
              );
            }

            if (block.type === "video" && block.video?.url) {
              return (
                <Box key={index} mb={4}>
                  {block.video.title && (
                    <Typography variant="h6" mb={2} fontWeight={600}>
                      🎥 {block.video.title}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "40%",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={getYoutubeEmbedUrl(block.video.url)}
                      title={block.video.title || "Video"}
                      allowFullScreen
                      style={{
                        position: "absolute",
                        borderRadius: "8px",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                    />
                  </Box>
                </Box>
              );
            }

            if (block.type === "link" && block.link?.url) {
              return (
                <Box key={index} mb={3}>
                  <Typography mb={1}>
                    🔗{" "}
                    <Link
                      href={block.link.url}
                      target="_blank"
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      {block.link.title || block.link.url}
                    </Link>
                  </Typography>
                </Box>
              );
            }

            if (block.type === "example" && block.example?.text) {
              return (
                <Box key={index} mb={4}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "#f7f7f7",
                      border: "1px solid #e0e0e0",
                      fontFamily: "monospace",
                      overflowX: "auto",
                    }}
                  >
                    <Typography fontSize={13} mb={1} fontWeight={700}>
                      Example
                    </Typography>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {block.example.text}
                    </pre>
                  </Paper>
                </Box>
              );
            }

            return null;
          })
        ) : (
          <>
            <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
              {lesson.content}
            </Typography>

            {lesson.videos?.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" mb={2}>
                  🎥 Videos
                </Typography>

                {lesson.videos.map((video: VideoType, index: number) => (
                  <Box key={index} mb={3}>
                    <Typography fontWeight={500} mb={1}>
                      {video.title}
                    </Typography>

                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "40%",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <iframe
                        src={getYoutubeEmbedUrl(video.url)}
                        title={video.title}
                        allowFullScreen
                        style={{
                          position: "absolute",
                          borderRadius: "8px",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {lesson.links?.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" mb={2}>
                  🔗 Resources
                </Typography>

                {lesson.links.map((link: VideoType, index: number) => (
                  <Typography key={index} mb={1}>
                    •{" "}
                    <Link href={link.url} target="_blank" underline="hover">
                      {link.title || link.url}
                    </Link>
                  </Typography>
                ))}
              </Box>
            )}

            {lesson.codes?.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" mb={2}>
                  💻 Examples
                </Typography>

                {lesson.codes.map((code: CodeType, index: number) => (
                  <Box key={index} mb={3}>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "#f7f7f7",
                        border: "1px solid #e0e0e0",
                        fontFamily: "monospace",
                        overflowX: "auto",
                      }}
                    >
                      <Typography fontSize={13} mb={1} fontWeight={700}>
                        Example
                      </Typography>

                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {code.code}
                      </pre>
                    </Paper>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}

        <Box sx={{ height: 24 }} />
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          p: 2,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          onClick={() => prevLesson && onSelect(prevLesson)}
          disabled={!prevLesson}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Prev
        </Button>

        <Button
          variant={isCurrentCompleted ? "outlined" : "contained"}
          color={isCurrentCompleted ? "success" : "primary"}
          disabled={isCurrentCompleted}
          onClick={() => activeLesson && markLessonComplete(activeLesson._id)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isCurrentCompleted ? "✔ Completed" : "Mark as Completed"}
        </Button>

        <Button
          variant="contained"
          endIcon={<ChevronRightIcon />}
          onClick={handleNext}
          disabled={!nextLesson}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
