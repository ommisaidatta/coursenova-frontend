"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  Grid,
  MenuItem,
} from "@mui/material";
import { Edit, Save, Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CommonToast from "@/app/component/alertToast";
import ChangePasswordDialog from "@/app/component/updatePasswordDialog";
import axiosInstance from "@/app/utils/axiosInstance";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    totalEnrollments: 0,
  });
  // Display profile - only updates after Save, not while typing
  const [displayProfile, setDisplayProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axiosInstance
      .get("/profile")
      .then((res) => {
        const data = res.data;
        const profileData = {
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "",
          totalEnrollments: data.totalEnrollments || 0,
        };
        setProfile(profileData);
        // Set display profile to same values initially
        setDisplayProfile({
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          email: profileData.email,
        });
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await axiosInstance.put("/profile", {
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        gender: profile.gender,
      });

      const updatedProfile = {
        ...profile,
        totalEnrollments: res.data.totalEnrollments ?? profile.totalEnrollments,
      };
      setProfile(updatedProfile);

      // Update display profile only after successful save
      setDisplayProfile({
        firstname: res.data.firstname,
        lastname: res.data.lastname,
        email: res.data.email,
      });

      setEditMode(false);

      // Trigger header refresh by dispatching custom event
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: {
            firstname: res.data.firstname,
            lastname: res.data.lastname,
            email: res.data.email,
          },
        }),
      );

      setToast({
        open: true,
        message: "Profile updated!",
        severity: "success",
      });
    } catch (error) {
      setToast({
        open: true,
        message: "Update failed",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={4}
      >
        <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main" }}>
          {(
            displayProfile.lastname?.charAt(0) ||
            displayProfile.firstname?.charAt(0) ||
            "U"
          ).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={600}>
            {displayProfile.lastname} {displayProfile.firstname}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {displayProfile.email}
          </Typography>
        </Box>
      </Box>

      {/* Account Details row: title + Change Password + Edit */}
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Typography variant="h6" fontWeight={600}>
          Account Details
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setPasswordOpen(true)}
            sx={{
              p: { xs: 0.5, sm: 1 },
              fontSize: { xs: "12px" },
            }}
          >
            Change Password
          </Button>
          <IconButton
            onClick={() => {
              if (editMode) {
                axiosInstance
                  .get("/profile")
                  .then((res) => {
                    const data = res.data;
                    setProfile({
                      firstname: data.firstname || "",
                      lastname: data.lastname || "",
                      email: data.email || "",
                      phone: data.phone || "",
                      address: data.address || "",
                      gender: data.gender || "",
                      totalEnrollments: data.totalEnrollments || 0,
                    });
                  })
                  .catch(() => {
                    setProfile((prev) => ({
                      ...prev,
                      firstname: displayProfile.firstname,
                      lastname: displayProfile.lastname,
                      email: displayProfile.email,
                    }));
                  });
              }
              setEditMode(!editMode);
            }}
            disabled={updating}
            color={editMode ? "error" : "primary"}
          >
            {editMode ? <Close /> : <Edit />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="First Name"
            value={profile.firstname}
            onChange={(e) =>
              setProfile({ ...profile, firstname: e.target.value })
            }
            disabled={!editMode || updating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Last Name"
            value={profile.lastname}
            onChange={(e) =>
              setProfile({ ...profile, lastname: e.target.value })
            }
            disabled={!editMode || updating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            disabled={!editMode || updating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            disabled={!editMode || updating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Address"
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
            disabled={!editMode || updating}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            select
            label="Gender"
            value={(profile.gender || "").toLowerCase()}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            disabled={!editMode || updating}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {editMode && (
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => {
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          )}
        </Grid>

        <CommonToast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </Grid>
      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </Box>
  );
}
