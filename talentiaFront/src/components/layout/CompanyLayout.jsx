import { Box } from "@mui/material";
import Sidebar from "../companies/SideBar";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <Box sx={{ width: 260, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#fafaf8" }}>
        {children}
      </Box>

    </Box>
  );
};

export default MainLayout;