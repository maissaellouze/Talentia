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
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ role = 'student', activeTab, setActiveTab }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const studentItems = [
    { label: "Dashboard", path: "/home", icon: <DashboardIcon /> },
    { label: "Entreprises", path: "/companies", icon: <BusinessIcon /> },
    { label: "Opportunités", path: "/opportunities", icon: <WorkIcon /> },
    { label: "Rapports PFE", path: "/reports", icon: <WorkIcon /> },
 
  ];

  const companyItems = [
    { label: "Vos Offres", id: "opportunities", icon: <WorkIcon /> },
    { label: "Profil Entreprise", id: "profile", icon: <BusinessIcon /> },
  ];

  const items = role === 'student' ? studentItems : companyItems;

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#fff",
        borderRight: "1px solid #e5e5ec",
        display: "flex",
        flexDirection: "column",
        position: 'sticky',
        top: 0,
        width: 260,
        zIndex: 100
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
            background: theme.palette.primary.main || '#0d9488',
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
          Talent<span style={{ color: theme.palette.primary.main || '#0d9488' }}>IA</span>
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {items.map((item) => {
          const isActive = role === 'student' 
            ? location.pathname === item.path 
            : activeTab === item.id;

          const handleClick = () => {
            if (role === 'student') navigate(item.path);
            else setActiveTab(item.id);
          };

          return (
            <ListItem disablePadding key={item.label} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={handleClick}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main || '#0d9488', 0.1)
                    : "transparent",
                  color: isActive ? (theme.palette.primary.main || '#0d9488') : "#6b7280",
                  "&:hover": {
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main || '#0d9488', 0.15)
                      : alpha(theme.palette.primary.main || '#0d9488', 0.05),
                    color: isActive ? (theme.palette.primary.main || '#0d9488') : "#0a0a12",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "14px",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #e5e5ec' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "#6b7280",
            "&:hover": {
              bgcolor: alpha(theme.palette.error?.main || '#ef4444', 0.05),
              color: theme.palette.error?.main || '#ef4444',
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "14px",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
const studentItems = [
  { label: "Dashboard", path: "/home", icon: <DashboardIcon /> },
  { label: "Entreprises", path: "/companies", icon: <BusinessIcon /> },
  { label: "Opportunités", path: "/opportunities", icon: <WorkIcon /> },
  { label: "Rapports PFE", path: "/reports", icon: <WorkIcon /> },
];