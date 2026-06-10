// ============================================================
// App.tsx — Router entry point with lazy-loaded pages
// ============================================================

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AppErrorBoundary from './components/ui/ErrorBoundary';
import { Skeleton } from './components/ui/Skeleton';

// Page lazy imports for performance optimization
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tracker = React.lazy(() => import('./pages/Tracker'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Settings = React.lazy(() => import('./pages/Settings'));

const PageLoader: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 lg:col-span-1" />
      <Skeleton className="h-64 lg:col-span-2" />
    </div>
  </div>
);

function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AppErrorBoundary>
  );
}

export default App;
