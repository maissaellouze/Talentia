import React from "react";
import StudentSidebar from "./StudentSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      
      <StudentSidebar />

      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {children}
      </main>

    </div>
  );
};

export default StudentLayout;