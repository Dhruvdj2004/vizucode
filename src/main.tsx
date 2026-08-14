import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import RequireAuth from './lib/RequireAuth';
import './styles.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const VisualizerPage = lazy(() => import('./pages/VisualizerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const DbmsPage = lazy(() => import('./pages/DbmsPage'));
const DbmsTopicPage = lazy(() => import('./pages/DbmsTopicPage'));
const RevisionPage = lazy(() => import('./pages/RevisionPage'));
const RevisionTopicPage = lazy(() => import('./pages/RevisionTopicPage'));
const CorePage = lazy(() => import('./pages/CorePage'));
const OsPage = lazy(() => import('./pages/OsPage'));
const OsTopicPage = lazy(() => import('./pages/OsTopicPage'));
const OopsPage = lazy(() => import('./pages/OopsPage'));
const OopsTopicPage = lazy(() => import('./pages/OopsTopicPage'));
const CnPage = lazy(() => import('./pages/CnPage'));
const CnTopicPage = lazy(() => import('./pages/CnTopicPage'));
const SqlPage = lazy(() => import('./pages/SqlPage'));
const SqlTopicPage = lazy(() => import('./pages/SqlTopicPage'));
const SdPage = lazy(() => import('./pages/SdPage'));
const SdTopicPage = lazy(() => import('./pages/SdTopicPage'));

function PageFallback() {
  return <div className="page-loading">Loading…</div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<App />}>
            <Route
              index
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="visualize/:slug"
              element={
                <RequireAuth>
                  <VisualizerPage />
                </RequireAuth>
              }
            />
            <Route
              path="dbms"
              element={
                <RequireAuth>
                  <DbmsPage />
                </RequireAuth>
              }
            />
            <Route
              path="dbms/:slug"
              element={
                <RequireAuth>
                  <DbmsTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="revision"
              element={
                <RequireAuth>
                  <RevisionPage />
                </RequireAuth>
              }
            />
            <Route
              path="revision/:slug"
              element={
                <RequireAuth>
                  <RevisionTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="core"
              element={
                <RequireAuth>
                  <CorePage />
                </RequireAuth>
              }
            />
            <Route
              path="os"
              element={
                <RequireAuth>
                  <OsPage />
                </RequireAuth>
              }
            />
            <Route
              path="os/:slug"
              element={
                <RequireAuth>
                  <OsTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="oops"
              element={
                <RequireAuth>
                  <OopsPage />
                </RequireAuth>
              }
            />
            <Route
              path="oops/:slug"
              element={
                <RequireAuth>
                  <OopsTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="cn"
              element={
                <RequireAuth>
                  <CnPage />
                </RequireAuth>
              }
            />
            <Route
              path="cn/:slug"
              element={
                <RequireAuth>
                  <CnTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="sql"
              element={
                <RequireAuth>
                  <SqlPage />
                </RequireAuth>
              }
            />
            <Route
              path="sql/:slug"
              element={
                <RequireAuth>
                  <SqlTopicPage />
                </RequireAuth>
              }
            />
            <Route
              path="sd"
              element={
                <RequireAuth>
                  <SdPage />
                </RequireAuth>
              }
            />
            <Route
              path="sd/:slug"
              element={
                <RequireAuth>
                  <SdTopicPage />
                </RequireAuth>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="upgrade" element={<UpgradePage />} />
            <Route path="feedback" element={<FeedbackPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  </React.StrictMode>
);
