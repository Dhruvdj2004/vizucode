import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import VisualizerPage from './pages/VisualizerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UpgradePage from './pages/UpgradePage';
import DbmsPage from './pages/DbmsPage';
import DbmsTopicPage from './pages/DbmsTopicPage';
import RevisionPage from './pages/RevisionPage';
import RevisionTopicPage from './pages/RevisionTopicPage';
import CorePage from './pages/CorePage';
import OsPage from './pages/OsPage';
import OsTopicPage from './pages/OsTopicPage';
import OopsPage from './pages/OopsPage';
import OopsTopicPage from './pages/OopsTopicPage';
import CnPage from './pages/CnPage';
import CnTopicPage from './pages/CnTopicPage';
import SqlPage from './pages/SqlPage';
import SqlTopicPage from './pages/SqlTopicPage';
import SdPage from './pages/SdPage';
import SdTopicPage from './pages/SdTopicPage';
import RequireAuth from './lib/RequireAuth';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
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
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
