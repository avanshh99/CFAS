// ============================================================
// Layout — Main app layout with sidebar and header
// ============================================================

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BadgeToast from '../gamification/BadgeToast';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tracker': 'Activity Tracker',
  '/chat': 'AI Assistant',
  '/insights': 'Insights',
  '/achievements': 'Achievements',
  '/settings': 'Settings',
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'EcoSense';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent-green focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />

        <main id="main-content" className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global achievement notifications */}
      <BadgeToast />
    </div>
  );
};

export default Layout;
