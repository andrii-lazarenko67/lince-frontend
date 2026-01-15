import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import theme from './theme';
import { MainLayout } from './components/layout';
import { PrivateRoute } from './components/auth';
import { PageLoader } from './components/common';

// Lazy load all pages for code splitting
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const SignupPage = lazy(() => import('./pages/Signup/SignupPage'));
const AddClientPage = lazy(() => import('./pages/Clients/AddClientPage'));
const FirstClientSetupPage = lazy(() => import('./pages/Clients/FirstClientSetupPage'));
const ClientsPage = lazy(() => import('./pages/Clients/ClientsPage'));
const ClientDetailPage = lazy(() => import('./pages/Clients/ClientDetailPage'));
const ClientUsersPage = lazy(() => import('./pages/Clients/ClientUsersPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const SystemsPage = lazy(() => import('./pages/Systems/SystemsPage'));
const SystemDetailPage = lazy(() => import('./pages/Systems/SystemDetailPage'));
const DailyLogsPage = lazy(() => import('./pages/DailyLogs/DailyLogsPage'));
const DailyLogDetailPage = lazy(() => import('./pages/DailyLogs/DailyLogDetailPage'));
const NewDailyLogPage = lazy(() => import('./pages/DailyLogs/NewDailyLogPage'));
const InspectionsPage = lazy(() => import('./pages/Inspections/InspectionsPage'));
const InspectionDetailPage = lazy(() => import('./pages/Inspections/InspectionDetailPage'));
const NewInspectionPage = lazy(() => import('./pages/Inspections/NewInspectionPage'));
const IncidentsPage = lazy(() => import('./pages/Incidents/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('./pages/Incidents/IncidentDetailPage'));
const NewIncidentPage = lazy(() => import('./pages/Incidents/NewIncidentPage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/Products/ProductDetailPage'));
const LibraryPage = lazy(() => import('./pages/Library/LibraryPage'));
const DocumentDetailPage = lazy(() => import('./pages/Library/DocumentDetailPage'));
const UsersPage = lazy(() => import('./pages/Users/UsersPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Standalone route for first client setup after signup */}
              <Route element={<PrivateRoute />}>
                <Route path="/add-client" element={<FirstClientSetupPage />} />
              </Route>

              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/daily-logs" element={<DailyLogsPage />} />
                  <Route path="/daily-logs/new" element={<NewDailyLogPage />} />
                  <Route path="/daily-logs/:id" element={<DailyLogDetailPage />} />

                  <Route path="/inspections" element={<InspectionsPage />} />
                  <Route path="/inspections/new" element={<NewInspectionPage />} />
                  <Route path="/inspections/:id" element={<InspectionDetailPage />} />

                  <Route path="/incidents" element={<IncidentsPage />} />
                  <Route path="/incidents/new" element={<NewIncidentPage />} />
                  <Route path="/incidents/:id" element={<IncidentDetailPage />} />

                  <Route path="/reports" element={<ReportsPage />} />

                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Manager and Admin routes */}
              <Route element={<PrivateRoute allowedRoles={['manager', 'admin']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/systems" element={<SystemsPage />} />
                  <Route path="/systems/:id" element={<SystemDetailPage />} />

                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />

                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/library/:id" element={<DocumentDetailPage />} />

                  {/* Client management routes (manager/admin only) */}
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/new" element={<AddClientPage />} />
                  <Route path="/clients/:id" element={<ClientDetailPage />} />
                  <Route path="/clients/:id/users" element={<ClientUsersPage />} />
                </Route>
              </Route>

              {/* Admin-only routes */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route element={<MainLayout />}>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
