"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import CommonToast from "@/app/component/alertToast";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CertificateDialog from "@/app/component/certificateDialog";
import axiosInstance from "@/app/utils/axiosInstance";

type CertificateItem = {
  _id: string;
  certificateId: string;
  courseId: { title: string };
  studentId?: { firstname: string; lastname: string };
  createdAt: string;
};

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    axiosInstance
      .get("/certificates/my-certificates")
      .then((res) => {
        const data = res.data;
        setCertificates(Array.isArray(data) ? data : []);
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleViewCertificate = (cert: CertificateItem) => {
    setSelectedCertificate(cert);
    setDialogOpen(true);
  };

  const handleDownload = async (certificateId: string) => {
    try {
      const response = await axiosInstance.get(
        `/certificates/download/${certificateId}`,
        { responseType: "blob" },
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToast({
        open: true,
        message: "Certificate downloaded successfully 🎉",
        severity: "success",
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Download failed. Please try again.";
      setToast({
        open: true,
        message:
          typeof message === "string"
            ? message
            : "Download failed. Please try again.",
        severity: "error",
      });
      try {
        const res = await axiosInstance.get("/certificates/my-certificates");
        setCertificates(Array.isArray(res.data) ? res.data : []);
      } catch (_) {}
    }
  };

  if (loading) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">Loading certificates...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        My Certificates
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Access certificates you’ve already downloaded.
      </Typography>

      {certificates.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <WorkspacePremiumIcon
            sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
          />
          <Typography color="text.secondary" variant="h6">
            No certificates yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete a course to earn your certificate.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {certificates.map((cert) => (
            <Grid key={cert._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <WorkspacePremiumIcon
                      sx={{ fontSize: 40, color: "primary.main" }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {cert.courseId?.title ?? "Course Certificate"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Certificate
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Issued on{" "}
                    {new Date(cert.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewCertificate(cert)}
                    sx={{ textTransform: "none", flex: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(cert.certificateId)}
                    sx={{ textTransform: "none", flex: 1 }}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CertificateDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCertificate(null);
        }}
        certificate={selectedCertificate}
        onDownload={handleDownload}
      />

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
}
