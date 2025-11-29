export interface DashboardStats {
  systems: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  dailyLogs: {
    today: number;
    thisWeek: number;
  };
  incidents: {
    open: number;
    thisWeek: number;
  };
  inspections: {
    pending: number;
    thisWeek: number;
  };
  products: {
    lowStock: number;
  };
  alerts: {
    unreadNotifications: number;
    outOfRangeToday: number;
  };
}

export interface RecentActivity {
  type: 'dailyLog' | 'inspection' | 'incident';
  id: number;
  title: string;
  user: string;
  date: string;
  system: string;
  status?: string;
  priority?: string;
}

export interface Alert {
  type: 'incident' | 'stock' | 'alert';
  priority: string;
  title: string;
  message: string;
  referenceId: number;
  createdAt: string;
}

export interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  alerts: Alert[];
  error: string | null;
}
