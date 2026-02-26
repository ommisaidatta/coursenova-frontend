"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
  Rating,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useEnrollment } from "@/app/context/enrollmentContext";
import { useRouter } from "next/navigation";
import RatingDialog from "@/app/component/ratingDialog";
import CommonToast from "@/app/component/alertToast";
import CertificateDialog from "@/app/component/certificateDialog";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "@/app/utils/axiosInstance";

export default function MyCoursesContent() {
  const { refreshKey } = useEnrollment();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [myRatingsByCourseId, setMyRatingsByCourseId] = useState<
    Record<string, { rating: number; review: string }>
  >({});

  const [certificatesByCourseId, setCertificatesByCourseId] = useState<
    Record<string, any>
  >({});

  const [downloadedCertificates, setDownloadedCertificates] = useState<
    Set<string>
  >(new Set());

  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateItem | null>(null);

  const [downloadingCourses, setDownloadingCourses] = useState<Set<string>>(
    new Set(),
  );
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [dialogOpen, setDialogOpen] = useState(false);

  type CertificateItem = {
    _id: string;
    certificateId: string;
    courseId: { title: string; _id: string };
    studentId?: { firstname: string; lastname: string };
    createdAt: string;
  };

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();

  useEffect(() => {
    axiosInstance
      .get("/enroll/my")
      .then((res) => {
        setMyCourses(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    axiosInstance
      .get("/rating/my")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const map: Record<string, { rating: number; review: string }> = {};
        data.forEach((r: any) => {
          if (!r?.course) return;
          map[String(r.course)] = {
            rating: Number(r.rating ?? 0),
            review: String(r.review ?? ""),
          };
        });
        setMyRatingsByCourseId(map);
      })
      .catch(() => {});

    axiosInstance
      .get("/certificates/my-certificates")
      .then((res) => {
        const certs = Array.isArray(res.data) ? res.data : [];
        const map: Record<string, any> = {};
        certs.forEach((cert: any) => {
          const courseId =
            typeof cert.courseId === "object"
              ? cert.courseId._id
              : cert.courseId;
          map[String(courseId)] = cert;
        });
        setCertificatesByCourseId(map);
      })
      .catch(() => {});
  }, [refreshKey]);

  if (loading) {
    return <Typography>Loading my courses...</Typography>;
  }

  if (!myCourses.length) {
    return (
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        No enrolled courses yet
      </Typography>
    );
  }

  const handleDownloadCertificate = async (certificateIdOrCourseId: string) => {
    if (downloadingCourses.has(certificateIdOrCourseId)) return;

    setDownloadingCourses((prev) => new Set(prev).add(certificateIdOrCourseId));
    setDownloadProgress((prev) => ({ ...prev, [certificateIdOrCourseId]: 0 }));
    try {
      let certificateId = certificateIdOrCourseId;

      const isCourseId =
        !certificateId.includes("-") || certificateId.length === 24;
      if (isCourseId || !certificatesByCourseId[certificateIdOrCourseId]) {
        const generateRes = await axiosInstance.post("/certificates/generate", {
          courseId: certificateIdOrCourseId,
        });

        const certificate = generateRes.data;
        certificateId = certificate.certificateId;

        setCertificatesByCourseId((prev) => ({
          ...prev,
          [certificateIdOrCourseId]: certificate,
        }));
      }
      setDownloadProgress((prev) => ({
        ...prev,
        [certificateIdOrCourseId]: 50,
      }));

      const downloadRes = await axiosInstance.get(
        `/certificates/download/${certificateId}`,
        { responseType: "blob" },
      );

      setDownloadProgress((prev) => ({
        ...prev,
        [certificateIdOrCourseId]: 100,
      }));

      const blob = downloadRes.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      try {
        const certsRes = await axiosInstance.get(
          "/certificates/my-certificates",
        );
        const certs = certsRes.data;
        const map: Record<string, any> = {};
        (Array.isArray(certs) ? certs : []).forEach((cert: any) => {
          const courseId =
            typeof cert.courseId === "object"
              ? cert.courseId._id
              : cert.courseId;
          map[String(courseId)] = cert;
        });
        setCertificatesByCourseId(map);
      } catch (err) {}

      setDownloadedCertificates((prev) =>
        new Set(prev).add(String(certificateIdOrCourseId)),
      );

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
    } finally {
      setDownloadingCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(certificateIdOrCourseId);
        return newSet;
      });
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[certificateIdOrCourseId];
        return newProgress;
      });
    }
  };

  const handleViewCertificate = async (certificate: CertificateItem) => {
    if (!certificate.studentId) {
      try {
        const res = await axiosInstance.get("/certificates/my-certificates");
        const certs = Array.isArray(res.data) ? res.data : [];
        const fullCert = certs.find(
          (c: any) => c.certificateId === certificate.certificateId,
        );
        if (fullCert) {
          setSelectedCertificate(fullCert);
          setDialogOpen(true);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch certificate details", err);
      }
    }
    setSelectedCertificate(certificate);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        My Courses
      </Typography>

      <Grid container spacing={2}>
        {myCourses.map((item) => (
          <Grid key={item._id} size={{ xs: 12, sm: 6, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                height: "100%",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  "&:last-child": { pb: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}
                    noWrap
                  >
                    {item.course.title}
                  </Typography>
                  <Chip
                    label={item.progress === 100 ? "Completed" : "In Progress"}
                    color={item.progress === 100 ? "success" : "primary"}
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": { borderRadius: 1 },
                    }}
                  />
                </Box>

                {/* Action + Rating Section */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  {/* Buttons Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        router.push(
                          `/dashboard/sections/myCourses?courseId=${item.course._id}`,
                        )
                      }
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {item.progress === 100
                        ? "View Course"
                        : "Continue Learning"}
                    </Button>

                    {item.progress === 100 &&
                      (certificatesByCourseId[item.course._id] ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            handleViewCertificate(
                              certificatesByCourseId[item.course._id],
                            )
                          }
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          View Certificate
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleDownloadCertificate(item.course._id)
                            }
                            disabled={downloadingCourses.has(item.course._id)}
                            startIcon={
                              downloadingCourses.has(item.course._id) ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : undefined
                            }
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            {downloadingCourses.has(item.course._id)
                              ? "Downloading..."
                              : "Download Certificate"}
                          </Button>
                          {downloadingCourses.has(item.course._id) && (
                            <LinearProgress
                              variant="determinate"
                              value={downloadProgress[item.course._id] || 0}
                              sx={{ mt: 0.5, borderRadius: 1, height: 4 }}
                            />
                          )}
                        </>
                      ))}
                  </Box>

                  {/* Rating Section */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      minHeight: 36,
                    }}
                  >
                    {item.progress === 100 ? (
                      <>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            color="text.secondary"
                          >
                            Rating:
                          </Typography>
                          <Rating
                            value={
                              myRatingsByCourseId[item.course._id]?.rating ?? 0
                            }
                            precision={0.5}
                            readOnly
                            size="small"
                          />
                        </Box>

                        <Button
                          size="small"
                          variant={
                            myRatingsByCourseId[item.course._id]?.rating
                              ? "outlined"
                              : "contained"
                          }
                          onClick={() => {
                            setSelectedCourse(item.course);
                            setRatingOpen(true);
                          }}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          {myRatingsByCourseId[item.course._id]?.rating
                            ? "Edit"
                            : "Review"}
                        </Button>
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Complete the course to leave a review
                        </Typography>
                        <Button
                          size="small"
                          disabled
                          variant="outlined"
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            opacity: 0.6,
                            minWidth: 80,
                          }}
                        >
                          Review
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CommonToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity as any}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <CertificateDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCertificate(null);
        }}
        certificate={selectedCertificate}
        onDownload={handleDownloadCertificate}
      />

      <RatingDialog
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        courseId={selectedCourse?._id || ""}
        courseTitle={selectedCourse?.title}
        existingRating={myRatingsByCourseId[selectedCourse?._id]?.rating ?? 0}
        existingReview={myRatingsByCourseId[selectedCourse?._id]?.review ?? ""}
        onSuccess={({ rating, review }) => {
          if (!selectedCourse?._id) return;
          setMyRatingsByCourseId((prev) => ({
            ...prev,
            [selectedCourse._id]: { rating, review },
          }));
        }}
      />
    </Box>
  );
}
