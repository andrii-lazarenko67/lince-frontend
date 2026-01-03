import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToSystems = useCallback(() => {
    navigate('/systems');
  }, [navigate]);

  const goToSystemDetail = useCallback((id: number) => {
    navigate(`/systems/${id}`);
  }, [navigate]);

  const goToMonitoringPoints = useCallback((systemId: number) => {
    navigate(`/systems/${systemId}/monitoring-points`);
  }, [navigate]);

  const goToDailyLogs = useCallback(() => {
    navigate('/daily-logs');
  }, [navigate]);

  const goToDailyLogDetail = useCallback((id: number) => {
    navigate(`/daily-logs/${id}`);
  }, [navigate]);

  const goToNewDailyLog = useCallback(() => {
    navigate('/daily-logs/new');
  }, [navigate]);

  const goToInspections = useCallback(() => {
    navigate('/inspections');
  }, [navigate]);

  const goToInspectionDetail = useCallback((id: number) => {
    navigate(`/inspections/${id}`);
  }, [navigate]);

  const goToNewInspection = useCallback(() => {
    navigate('/inspections/new');
  }, [navigate]);

  const goToIncidents = useCallback(() => {
    navigate('/incidents');
  }, [navigate]);

  const goToIncidentDetail = useCallback((id: number) => {
    navigate(`/incidents/${id}`);
  }, [navigate]);

  const goToNewIncident = useCallback(() => {
    navigate('/incidents/new');
  }, [navigate]);

  const goToReports = useCallback(() => {
    navigate('/reports');
  }, [navigate]);

  const goToProducts = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const goToProductDetail = useCallback((id: number) => {
    navigate(`/products/${id}`);
  }, [navigate]);

  const goToLibrary = useCallback(() => {
    navigate('/library');
  }, [navigate]);

  const goToDocumentDetail = useCallback((id: number) => {
    navigate(`/library/${id}`);
  }, [navigate]);

  const goToUsers = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  const goToUserDetail = useCallback((id: number) => {
    navigate(`/users/${id}`);
  }, [navigate]);

  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const goToNotifications = useCallback(() => {
    navigate('/notifications');
  }, [navigate]);

  const goToAddClient = useCallback(() => {
    navigate('/add-client');
  }, [navigate]);

  const goToClients = useCallback(() => {
    navigate('/clients');
  }, [navigate]);

  const goToSignup = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  return {
    goTo,
    goBack,
    goToLogin,
    goToDashboard,
    goToSystems,
    goToSystemDetail,
    goToMonitoringPoints,
    goToDailyLogs,
    goToDailyLogDetail,
    goToNewDailyLog,
    goToInspections,
    goToInspectionDetail,
    goToNewInspection,
    goToIncidents,
    goToIncidentDetail,
    goToNewIncident,
    goToReports,
    goToProducts,
    goToProductDetail,
    goToLibrary,
    goToDocumentDetail,
    goToUsers,
    goToUserDetail,
    goToSettings,
    goToNotifications,
    goToAddClient,
    goToClients,
    goToSignup
  };
};

export default useAppNavigation;
