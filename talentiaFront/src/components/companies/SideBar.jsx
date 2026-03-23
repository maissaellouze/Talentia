import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Business as BusinessIcon,
  WorkOutline as WorkIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Entreprises", path: "/companies", icon: <BusinessIcon /> },
    { label: "Opportunités", path: "/opportunities", icon: <WorkIcon /> },
    { label: "Admin Sociétés", path: "/admin/societes", icon: <AdminIcon /> },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        borderRight: "1px solid #e5e5ec",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{ p: 3, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: theme.palette.primary.main,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: 18, height: 3, bgcolor: "white", mb: 0.5 }} />
          <Box sx={{ width: 3, height: 9, bgcolor: "white" }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Clash Display", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#0a0a12",
          }}
        >
          Talent<span style={{ color: theme.palette.primary.main }}>AI</span>
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <ListItem disablePadding key={item.label} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                  color: active ? theme.palette.primary.main : "#6b7280",
                  "&:hover": {
                    bgcolor: active
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.05),
                    color: active ? theme.palette.primary.main : "#0a0a12",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                    fontSize: "14px",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
