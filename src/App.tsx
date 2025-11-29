import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/layout';
import { PrivateRoute } from './components/auth';
import {
  LoginPage,
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
  NotificationsPage
} from './pages';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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
              <Route path="/settings" element={<SettingsPage />} />
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
    </Provider>
  );
};

export default App;
