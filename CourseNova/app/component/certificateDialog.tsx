"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Block } from "@mui/icons-material";

type CertificateItem = {
  _id: string;
  certificateId: string;
  courseId: { title: string; duration?: string };
  studentId?: { firstname: string; lastname: string };
  createdAt: string;
};

interface CertificateDialogProps {
  open: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
  onDownload: (certificateId: string) => void;
}

export default function CertificateDialog({
  open,
  onClose,
  certificate,
  onDownload,
}: CertificateDialogProps) {
  const theme = useTheme();

  if (!certificate) return null;

  const name =
    certificate.studentId?.firstname && certificate.studentId?.lastname
      ? `${certificate.studentId.firstname} ${certificate.studentId.lastname}`
      : "Student";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "visible",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        Certificate of Completion
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: "3px double",
            borderColor: "primary.main",
            m: 2,
            position: "relative",
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            minHeight: 400,
            py: 4,
          }}
        >
          {/* Corner ornaments */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 48,
              height: 48,
              borderTop: "3px solid",
              borderLeft: "3px solid",
              borderColor: "primary.dark",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 48,
              height: 48,
              borderTop: "3px solid",
              borderRight: "3px solid",
              borderColor: "primary.dark",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              width: 48,
              height: 48,
              borderBottom: "3px solid",
              borderLeft: "3px solid",
              borderColor: "primary.dark",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              width: 48,
              height: 48,
              borderBottom: "3px solid",
              borderRight: "3px solid",
              borderColor: "primary.dark",
            }}
          />

          <Box sx={{ px: 4, py: 4, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <WorkspacePremiumIcon
                sx={{ fontSize: 48, color: "primary.main" }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              letterSpacing={2}
              color="primary.main"
              sx={{ textTransform: "uppercase", mb: 1 }}
            >
              Certificate of Completion
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              This is to certify that
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              {name}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              has successfully completed the course
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              color="primary.dark"
              sx={{ mb: 1 }}
            >
              {certificate.courseId?.title ?? "—"}
            </Typography>

            {certificate.courseId?.duration && (
              <Typography
                variant="body1"
                color="text.secondary"
                display="block"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                Duration: {certificate.courseId.duration}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Issued on{" "}
              {new Date(certificate.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            {/* <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              Certificate ID: {certificate.certificateId}
            </Typography> */}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              onDownload(certificate.certificateId);
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Download PDF
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
