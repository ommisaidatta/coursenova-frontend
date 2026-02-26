"use client";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import CertificateDialog from "@/app/component/certificateDialog";

type CertificateItem = {
  _id: string;
  certificateId: string;
  courseId: { title: string };
  studentId?: { firstname: string; lastname: string };
  createdAt: string;
};

export default function DashboardCourses({
  enrollments,
  certificatesByCourseId = {},
}: {
  enrollments: any[];
  certificatesByCourseId?: Record<string, CertificateItem | any>;
}) {
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateItem | null>(null);

  const handleDownloadCertificate = async (courseId: string) => {
    setDownloadingId(courseId);
    try {
      const generateRes = await axiosInstance.post("/certificates/generate", {
        courseId,
      });
      const certificateId = generateRes.data.certificateId;
      const downloadRes = await axiosInstance.get(
        `/certificates/download/${certificateId}`,
        {
          responseType: "blob",
        },
      );
      const blob = downloadRes.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadByCertificateId = (certificateId: string) => {
    (async () => {
      try {
        const downloadRes = await axiosInstance.get(
          `/certificates/download/${certificateId}`,
          {
            responseType: "blob",
          },
        );
        const blob = downloadRes.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    })();
  };

  const handleViewCertificate = (cert: CertificateItem | any) => {
    setSelectedCertificate(cert);
    setCertDialogOpen(true);
  };

  if (!enrollments.length) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary" variant="h6">
          No enrolled courses
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        My Courses
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 2 }}>
        {enrollments.map((item) => {
          const cert = certificatesByCourseId[item.course._id];
          const hasCertificate = !!cert;
          const isCompleted = item.status === "Completed";

          return (
            <Grid key={item._id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    {item.course.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={item.status}
                      size="small"
                      color={
                        item.status === "Completed" ? "success" : "primary"
                      }
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {item.progress}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: "grey.200",
                      "& span": { borderRadius: 1 },
                    }}
                  />
                  <Box mt={2} sx={{ mt: "auto", pt: 2 }}>
                    <Button
                      size="small"
                      variant={isCompleted ? "outlined" : "contained"}
                      fullWidth
                      disabled={
                        isCompleted &&
                        !hasCertificate &&
                        downloadingId === item.course._id
                      }
                      onClick={() => {
                        if (!isCompleted) {
                          router.push(
                            `/dashboard/sections/myCourses?courseId=${item.course._id}`,
                          );
                          return;
                        }
                        if (hasCertificate) {
                          handleViewCertificate(cert);
                        } else {
                          handleDownloadCertificate(item.course._id);
                        }
                      }}
                      sx={{
                        p: 1,
                      }}
                    >
                      {!isCompleted
                        ? "Continue Learning"
                        : hasCertificate
                          ? downloadingId === item.course._id
                            ? "Downloading…"
                            : "View Certificate"
                          : downloadingId === item.course._id
                            ? "Downloading…"
                            : "Download Certificate"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <CertificateDialog
        open={certDialogOpen}
        onClose={() => {
          setCertDialogOpen(false);
          setSelectedCertificate(null);
        }}
        certificate={selectedCertificate}
        onDownload={handleDownloadByCertificateId}
      />
    </Box>
  );
}
