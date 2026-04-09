import React from 'react';
import Sidebar from '../companies/SideBar';

export default function MainLayout({ children, role = 'student', activeTab, setActiveTab }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf8' }}>
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
