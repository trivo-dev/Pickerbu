export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalProductImages: number;
}

export interface NamedCount {
  label: string;
  count: number;
}

export interface DailyCountPoint {
  date: string;
  count: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  usersByUserType: NamedCount[];
  productsCreatedDaily: DailyCountPoint[];
  usersRegisteredDaily: DailyCountPoint[];
  ordersByMonth: DailyCountPoint[];
}
