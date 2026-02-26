"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CommonToast from "./alertToast";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import axiosInstance from "@/app/utils/axiosInstance";

type ContentBlock = {
  type: "text" | "video" | "link" | "example";
  text?: string;
  video?: { title: string; url: string };
  link?: { title: string; url: string };
  example?: { text: string };
};

export default function AddLessonDialog({
  open,
  onClose,
  mode,
  lesson,
  courseId,
  lessonsCount = 0,
  onSuccess,
}: any) {
  const [form, setForm] = useState({ order: "", title: "" });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  const [addMenu, setAddMenu] = useState<{
    anchorEl: HTMLElement | null;
    index: number | null;
  }>({ anchorEl: null, index: null });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  useEffect(() => {
    if (mode === "edit" && lesson) {
      setForm({ order: lesson.order, title: lesson.title });

      if (lesson.contentBlocks?.length) {
        setContentBlocks(lesson.contentBlocks);
      } else {
        const blocks: ContentBlock[] = [];

        if (lesson.content) {
          blocks.push({ type: "text", text: lesson.content });
        }

        lesson.videos?.forEach((v: any) =>
          blocks.push({
            type: "video",
            video: { title: v.title || "", url: v.url || "" },
          }),
        );

        lesson.links?.forEach((l: any) =>
          blocks.push({
            type: "link",
            link: { title: l.title || "", url: l.url || "" },
          }),
        );

        lesson.codes?.forEach((c: any) =>
          blocks.push({
            type: "example",
            example: { text: c.code || "" },
          }),
        );

        setContentBlocks(blocks.length ? blocks : [{ type: "text", text: "" }]);
      }
    } else {
      setForm({ order: "", title: "" });
      setContentBlocks([{ type: "text", text: "" }]);
    }
  }, [mode, lesson]);

  const addBlock = (type: ContentBlock["type"], index?: number) => {
    const newBlock: ContentBlock = { type };

    if (type === "text") newBlock.text = "";
    if (type === "video") newBlock.video = { title: "", url: "" };
    if (type === "link") newBlock.link = { title: "", url: "" };
    if (type === "example") newBlock.example = { text: "" };

    const updated = [...contentBlocks];

    if (index !== undefined) updated.splice(index + 1, 0, newBlock);
    else updated.push(newBlock);

    setContentBlocks(updated);
  };

  const removeBlock = (index: number) => {
    if (contentBlocks.length === 1) {
      setToast({
        open: true,
        message: "At least one content block required",
        severity: "warning",
      });
      return;
    }

    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: "up" | "down") => {
    if (
      (dir === "up" && index === 0) ||
      (dir === "down" && index === contentBlocks.length - 1)
    )
      return;

    const updated = [...contentBlocks];
    const newIndex = dir === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    setContentBlocks(updated);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const updated = [...contentBlocks];
    updated[index] = { ...updated[index], ...updates };
    setContentBlocks(updated);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setToast({
        open: true,
        message: "Title required",
        severity: "error",
      });
      return;
    }

    const filteredBlocks = contentBlocks.filter((b) => {
      if (b.type === "text") return b.text?.trim();
      if (b.type === "video") return b.video?.url;
      if (b.type === "link") return b.link?.url;
      if (b.type === "example") return b.example?.text?.trim();
      return false;
    });

    if (!filteredBlocks.length) {
      setToast({
        open: true,
        message: "Add at least one content",
        severity: "error",
      });
      return;
    }

    const body = {
      ...(mode === "create" && { courseId }),
      title: form.title,
      order: Number(form.order) || lessonsCount + 1,
      contentBlocks: filteredBlocks,
    };

    try {
      if (mode === "create") {
        await axiosInstance.post("/lesson", body);
      } else {
        await axiosInstance.put(`/lesson/${lesson._id}`, body);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setToast({
        open: true,
        message: error.response?.data?.message || "Failed to save lesson",
        severity: "error",
      });
    }
  };

  const addMenuItems = useMemo(
    () => [
      { label: "Text", type: "text" as const },
      { label: "Video", type: "video" as const },
      { label: "Link", type: "link" as const },
      { label: "Example", type: "example" as const },
    ],
    [],
  );

  const renderBlock = (block: ContentBlock, index: number) => (
    <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #e0e0e0" }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="caption" fontWeight={600}>
          {block.type.toUpperCase()}
        </Typography>

        <Box>
          <IconButton onClick={() => moveBlock(index, "up")}>
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>

          <IconButton onClick={() => moveBlock(index, "down")}>
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>

          <IconButton color="error" onClick={() => removeBlock(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* TEXT */}
      {block.type === "text" && (
        <TextField
          multiline
          minRows={4}
          fullWidth
          value={block.text}
          onChange={(e) => updateBlock(index, { text: e.target.value })}
        />
      )}

      {/* VIDEO */}
      {block.type === "video" && (
        <Box display="flex" flexDirection="column" gap={1}>
          <TextField
            label="Video Title"
            value={block.video?.title}
            onChange={(e) =>
              updateBlock(index, {
                video: { ...block.video!, title: e.target.value },
              })
            }
          />

          <TextField
            label="Video URL"
            value={block.video?.url}
            onChange={(e) =>
              updateBlock(index, {
                video: { ...block.video!, url: e.target.value },
              })
            }
          />
        </Box>
      )}

      {/* LINK */}
      {block.type === "link" && (
        <Box display="flex" flexDirection="column" gap={1}>
          <TextField
            label="Link Title"
            value={block.link?.title}
            onChange={(e) =>
              updateBlock(index, {
                link: { ...block.link!, title: e.target.value },
              })
            }
          />

          <TextField
            label="URL"
            value={block.link?.url}
            onChange={(e) =>
              updateBlock(index, {
                link: { ...block.link!, url: e.target.value },
              })
            }
          />
        </Box>
      )}

      {/* EXAMPLE */}
      {block.type === "example" && (
        <TextField
          multiline
          minRows={4}
          fullWidth
          label="Example Code"
          value={block.example?.text}
          onChange={(e) =>
            updateBlock(index, { example: { text: e.target.value } })
          }
        />
      )}

      <Box mt={2}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={(e) => setAddMenu({ anchorEl: e.currentTarget, index })}
        >
          Add Row
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "create" ? "Add Lesson" : "Edit Lesson"}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Order"
          type="number"
          fullWidth
          sx={{ mb: 2, mt: 2 }}
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
        />

        <TextField
          label="Title"
          fullWidth
          sx={{ mb: 2 }}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {contentBlocks.map(renderBlock)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "create" ? "Add" : "Update"}
        </Button>
      </DialogActions>

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <Menu
        anchorEl={addMenu.anchorEl}
        open={Boolean(addMenu.anchorEl)}
        onClose={() => setAddMenu({ anchorEl: null, index: null })}
      >
        {addMenuItems.map((item) => (
          <MenuItem
            key={item.type}
            onClick={() => {
              addBlock(item.type, addMenu.index!);
              setAddMenu({ anchorEl: null, index: null });
            }}
          >
            Add {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Dialog>
  );
}
