import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import theme from './theme';
import { MainLayout } from './components/layout';
import { PrivateRoute } from './components/auth';
import {
  LoginPage,
  SignupPage,
  AddClientPage,
  FirstClientSetupPage,
  ClientsPage,
  ClientDetailPage,
  ClientUsersPage,
  DashboardPage,
  SystemsPage,
  SystemDetailPage,
  DailyLogsPage,
  DailyLogDetailPage,
  NewDailyLogPage,
  InspectionsPage,
  InspectionDetailPage,
  NewInspectionPage,
  IncidentsPage,
  IncidentDetailPage,
  NewIncidentPage,
  ReportsPage,
  ProductsPage,
  ProductDetailPage,
  LibraryPage,
  DocumentDetailPage,
  UsersPage,
  SettingsPage,
  NotificationsPage,
  ProfilePage
} from './pages';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
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
              <Route path="/settings" element={<SettingsPage />} />

              {/* Client management routes (service providers only) */}
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/new" element={<AddClientPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/clients/:id/users" element={<ClientUsersPage />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={['manager']} />}>
            <Route element={<MainLayout />}>
              <Route path="/systems" element={<SystemsPage />} />
              <Route path="/systems/:id" element={<SystemDetailPage />} />

              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/:id" element={<DocumentDetailPage />} />

              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
