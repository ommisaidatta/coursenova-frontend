"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Button,
  Paper,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ClickAwayListener,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState, useRef, useMemo } from "react";
import axiosInstance from "@/app/utils/axiosInstance";

const CATEGORY_OPTIONS = [
  "Frontend",
  "Backend",
  "Programming",
  "Fullstack",
  "DevOps",
  "Data Science",
  "Mobile",
  "Cloud",
  "Other",
];

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { key: "courses", label: "All Courses", icon: <MenuBookIcon /> },
  { key: "my-courses", label: "My Courses", icon: <SchoolIcon /> },
  {
    key: "certificates",
    label: "My Certificates",
    icon: <CardMembershipIcon />,
  },
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
];

interface Filters {
  level: string;
  category: string;
  enrollment: string;
  rating: string;
}

interface HeaderProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

export default function Header({
  onSearch,
  onFilterChange,
  activeSection = "dashboard",
  onSectionChange,
  onLogout,
}: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    level: "",
    category: "",
    enrollment: "",
    rating: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [courseTitles, setCourseTitles] = useState<string[]>([]);
  const [profile, setProfile] = useState<{
    firstname: string;
    lastname: string;
    email: string;
  }>({ firstname: "", lastname: "", email: "" });

  const open = Boolean(anchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const fetchProfile = () => {
    axiosInstance
      .get("/profile")
      .then((res) => {
        const data = res.data;
        if (!data) return;
        setProfile({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isDesktop) fetchProfile();
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setProfile({
          firstname: event.detail.firstname || "",
          lastname: event.detail.lastname || "",
          email: event.detail.email || "",
        });
      } else fetchProfile();
    };
    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener,
    );
    return () =>
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener,
      );
  }, [isDesktop]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterUpdate = (key: keyof Filters, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
    handleClose();
  };

  const handleReset = () => {
    const resetFilters = {
      level: "",
      category: "",
      enrollment: "",
      rating: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    handleClose();
  };

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courseTitles.slice(0, 8);
    return courseTitles
      .filter((title) => title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, courseTitles]);

  const handleSuggestionSelect = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    setSuggestionsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
    setSuggestionsOpen(false);
  };

  useEffect(() => {
    axiosInstance
      .get("/courses")
      .then((res) => {
        const data = res.data as unknown[] | { courses?: unknown[] };
        const list = Array.isArray(data) ? data : (data?.courses ?? []);
        const titles = (list as { title?: string }[])
          .map((c) => c.title)
          .filter(Boolean) as string[];
        setCourseTitles([...new Set(titles)]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#f1f5f9",
          color: "#000",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, md: 72 },
            px: { xs: 1, sm: 2, md: 3 },
            flexDirection: { xs: "row", md: "row" },
            alignItems: "center",
            gap: { xs: 1, md: 1.5 },
            justifyContent: "space-between",
          }}
        >
          {/* Mobile: Left Logo + Name. Desktop: no logo in header */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Coursenova Logo"
                sx={{
                  width: { xs: 120, sm: 120, md: 180 },
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          {/* Search */}
          <Box
            ref={searchAnchorRef}
            sx={{
              position: "relative",
              flex: 1,
              width: isDesktop ? "40%" : undefined,
              maxWidth: { xs: "100%", sm: 400, md: 500, lg: 600 },
              minWidth: { sm: 350, md: 400 },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 3px 5px rgba(0,0,0,0.12)",
                  borderColor: "#cbd5e1",
                  transform: "translateY(-1px)",
                },
                "&:focus-within": {
                  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                  // borderColor: "primary.main",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <TextField
                fullWidth
                placeholder="Search courses..."
                size={isDesktop ? "medium" : "small"}
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.trim().length > 0) setSuggestionsOpen(true);
                  else {
                    setSuggestionsOpen(false);
                    onSearch("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch(searchQuery);
                    setSuggestionsOpen(false);
                  }
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    borderRadius: 3,
                    height: { xs: 44, md: 48 },
                    bgcolor: "#fafbfc",
                    border: "none",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                    },
                    "&.Mui-focused": {
                      bgcolor: "#fff",
                      boxShadow: "none",
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: { xs: 1, md: 1.5 },
                    px: { md: 2 },
                    fontSize: { xs: "1rem", md: "1.05rem" }, // bigger
                    fontWeight: 500,
                    letterSpacing: "normal",
                    color: "text.primary",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    fontSize: "1rem",
                    opacity: 0.8,
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 0.5 }}>
                        <IconButton
                          edge="start"
                          onClick={() => onSearch(searchQuery)}
                          sx={{
                            p: { xs: 0, md: 1 },
                            color: "text.secondary",
                            "&:hover": {
                              bgcolor: "action.hover",
                              color: "primary.main",
                            },
                          }}
                          aria-label="search"
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 0.5 }}>
                        {searchQuery.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            sx={{
                              p: { xs: 0.5, md: 1 },
                              color: "text.secondary",
                              "&:hover": {
                                bgcolor: "error.light",
                                color: "error.main",
                              },
                            }}
                            aria-label="clear"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={handleFilterClick}
                          sx={{
                            p: { xs: 0, md: 1 },
                            color: "text.secondary",
                            "&:hover": {
                              bgcolor: "action.hover",
                              color: "primary.main",
                            },
                          }}
                          aria-label="filter"
                        >
                          <TuneIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Popper
                open={
                  suggestionsOpen &&
                  searchQuery.trim().length > 0 &&
                  suggestions.length > 0
                }
                anchorEl={searchAnchorRef.current}
                placement="bottom-start"
                style={{ zIndex: 1400 }}
                modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
              >
                <ClickAwayListener
                  onClickAway={() => setSuggestionsOpen(false)}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      mt: 0.5,
                      width: searchAnchorRef.current?.offsetWidth ?? 320,
                      maxHeight: 320,
                      overflow: "hidden",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <List dense disablePadding sx={{ bgcolor: "#fafbfc" }}>
                      {suggestions.map((s, i) => (
                        <ListItemButton
                          key={`${s}-${i}`}
                          onClick={() => handleSuggestionSelect(s)}
                          sx={{
                            py: 1.75,
                            px: 2.5,
                            borderBottom:
                              i < suggestions.length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                            "&:hover": {
                              bgcolor: "primary.50",
                            },
                            transition: "all 0.15s ease",
                          }}
                        >
                          <ListItemText
                            primary={s}
                            sx={{
                              my: 0,
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 500,
                                color: "text.primary",
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Paper>
          </Box>

          {/* Desktop (md+): Avatar + Welcome + Email */}
          {isDesktop && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Avatar sx={{ bgcolor: "#2563eb" }}>
                {(profile.firstname || profile.lastname
                  ? `${profile.firstname}${profile.lastname}`.charAt(0)
                  : "U"
                ).toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontSize={14}>
                  {profile.firstname || profile.lastname
                    ? `Welcome, ${profile.firstname} ${profile.lastname}`.trim()
                    : "Welcome"}
                </Typography>
                <Typography fontSize={13} color="text.secondary">
                  {profile.email || ""}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Mobile: Menu icon */}
          {isMobile && onSectionChange && onLogout && (
            <IconButton
              onClick={() => setMenuDrawerOpen(true)}
              aria-label="open menu"
              sx={{ flexShrink: 0, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Filter menu (all screens) */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <Box sx={{ p: 2, width: 220 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={filters.level}
              displayEmpty
              onChange={(e) => handleFilterUpdate("level", e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={filters.category}
              displayEmpty
              onChange={(e) => handleFilterUpdate("category", e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={filters.enrollment}
              displayEmpty
              onChange={(e) => handleFilterUpdate("enrollment", e.target.value)}
            >
              <MenuItem value="">All Courses</MenuItem>
              <MenuItem value="enrolled">Enrolled</MenuItem>
              <MenuItem value="unenrolled">Unenrolled</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={filters.rating}
              displayEmpty
              onChange={(e) => handleFilterUpdate("rating", e.target.value)}
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value="4">4★ & up</MenuItem>
              <MenuItem value="3">3★ & up</MenuItem>
              <MenuItem value="2">2★ & up</MenuItem>
              <MenuItem value="1">1★ & up</MenuItem>
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </Box>
      </Menu>

      {/* Mobile nav drawer */}
      {isMobile && (
        <Drawer
          anchor="right"
          open={menuDrawerOpen}
          onClose={() => setMenuDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: 280,
                maxWidth: "85vw",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Coursenova Logo"
              sx={{
                width: { xs: 160, md: 180 },
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <List>
              {MENU_ITEMS.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <ListItemButton
                    key={item.key}
                    onClick={() => {
                      onSectionChange?.(item.key);
                      setMenuDrawerOpen(false);
                    }}
                    sx={{
                      mb: 0.5,
                      mx: 1,
                      borderRadius: 2,
                      bgcolor: isActive ? "primary.main" : "transparent",
                      color: isActive ? "#fff" : "text.primary",
                      "&:hover": {
                        bgcolor: isActive ? "primary.dark" : "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
          <Box sx={{ p: 2, pt: 3, mt: "auto" }}>
            <Button
              startIcon={<LogoutIcon />}
              variant="outlined"
              fullWidth
              onClick={() => {
                onLogout?.();
                setMenuDrawerOpen(false);
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
      )}
    </>
  );
}
