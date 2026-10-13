export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number; // percentage
  carsInStock: number;
  carsSoldMonth: number;
  activeLeads: number;
  pendingOrders: number;
  totalCustomers: number;
}

export interface RecentActivity {
  id: string;
  type: 'ORDER_CREATED' | 'CAR_ADDED' | 'LEAD_WON' | 'STATUS_CHANGED' | 'TEST_DRIVE';
  title: string;
  description: string;
  user: string;
  timestamp: string;
}
