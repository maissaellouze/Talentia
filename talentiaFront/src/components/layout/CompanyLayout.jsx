import { Box } from "@mui/material";
import Sidebar from "../companies/SideBar";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar role="student" />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#fafaf8" }}>
        {children}
      </Box>

    </Box>
  );
};

export default MainLayout;