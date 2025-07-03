
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import POSInterface from './POSInterface';
import InventoryManagement from './InventoryManagement';
import UtangManagement from './UtangManagement';
import KPICards from './dashboard/KPICards';
import SalesChart from './dashboard/SalesChart';
import CategoryChart from './dashboard/CategoryChart';
import TopProducts from './dashboard/TopProducts';
import AIInsights from './dashboard/AIInsights';
import SeedDatabaseButton from './SeedDatabaseButton';
import RoleGuard from './auth/RoleGuard';
import { useUserRole } from '@/hooks/useUserRole';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ShieldX } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { role, isAdmin, loading } = useUserRole();
  const { salesAnalytics, productAnalytics, categoryAnalytics, isLoading: analyticsLoading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  // Calculate KPI data from analytics
  const totalSales = salesAnalytics.reduce((sum, day) => sum + day.total_sales, 0);
  const totalItems = salesAnalytics.reduce((sum, day) => sum + day.total_items, 0);
  const avgDailySales = salesAnalytics.length > 0 ? totalSales / salesAnalytics.length : 0;

  // Transform sales data for chart
  const salesChartData = salesAnalytics.slice(-7).map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: day.total_sales,
    items: day.total_items
  }));

  // Transform category data for chart
  const categoryChartData = categoryAnalytics.slice(0, 5).map((cat, index) => ({
    category: cat.categories?.name || 'Unknown',
    sales: cat.total_sales,
    color: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] || '#6b7280'
  }));

  // Transform product data for top products
  const topProductsData = productAnalytics
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(product => ({
      name: product.products?.name || 'Unknown Product',
      sold: product.quantity_sold,
      revenue: product.revenue
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management System</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
                {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                {role === 'admin' ? 'Administrator' : 'Cashier'}
              </Badge>
            </div>
          </div>
          <RoleGuard allowedRoles={['admin']}>
            <SeedDatabaseButton />
          </RoleGuard>
        </div>

        {!isAdmin && (
          <Alert className="mb-6">
            <ShieldX className="h-4 w-4" />
            <AlertDescription>
              You are logged in as a Cashier. You can view inventory but cannot modify it. Contact an administrator for inventory changes.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pos">POS</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="utang">Utang</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {analyticsLoading ? (
              <div className="text-center py-8">Loading analytics...</div>
            ) : (
              <>
                <KPICards 
                  totalSales={totalSales}
                  totalItems={totalItems}
                  avgDailySales={avgDailySales}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SalesChart data={salesChartData} />
                  <CategoryChart data={categoryChartData} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TopProducts products={topProductsData} />
                  <AIInsights />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="pos">
            <POSInterface />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="utang">
            <UtangManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and reporting features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">Advanced analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
