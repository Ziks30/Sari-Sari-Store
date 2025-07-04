
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import KPICards from '../dashboard/KPICards';
import SalesChart from '../dashboard/SalesChart';
import CategoryChart from '../dashboard/CategoryChart';
import TopProducts from '../dashboard/TopProducts';
import RealtimeActivityFeed from './RealtimeActivityFeed';

const AnalyticsDashboard = () => {
  const { 
    salesAnalytics, 
    productAnalytics, 
    categoryAnalytics, 
    isLoading, 
    refreshAnalytics 
  } = useRealtimeAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-pulse" />
          <div className="text-lg">Loading real-time analytics...</div>
        </div>
      </div>
    );
  }

  // Calculate KPI data from analytics
  const totalSales = salesAnalytics?.reduce((sum, day) => sum + day.total_sales, 0) || 0;
  const totalItems = salesAnalytics?.reduce((sum, day) => sum + day.total_items, 0) || 0;
  const avgDailySales = salesAnalytics?.length > 0 ? totalSales / salesAnalytics.length : 0;

  // Transform sales data for chart (last 7 days)
  const salesChartData = (salesAnalytics || []).slice(-7).reverse().map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: day.total_sales,
    items: day.total_items
  }));

  // Transform category data for chart (top 5)
  const categoryChartData = (categoryAnalytics || [])
    .reduce((acc, cat) => {
      const existing = acc.find(item => item.category === cat.categories?.name);
      if (existing) {
        existing.sales += cat.total_sales;
      } else {
        acc.push({
          category: cat.categories?.name || 'Unknown',
          sales: cat.total_sales,
          color: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][acc.length] || '#6b7280'
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Transform product data for top products (top 5)
  const topProductsData = (productAnalytics || [])
    .reduce((acc, product) => {
      const existing = acc.find(item => item.name === product.products?.name);
      if (existing) {
        existing.sold += product.quantity_sold;
        existing.revenue += product.revenue;
      } else {
        acc.push({
          name: product.products?.name || 'Unknown Product',
          sold: product.quantity_sold,
          revenue: product.revenue
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-green-500" />
              <span>Live Updates</span>
            </Badge>
            <p className="text-sm text-gray-600">
              Analytics update automatically when new transactions occur
            </p>
          </div>
        </div>
        <Button
          onClick={refreshAnalytics}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <KPICards 
        totalSales={totalSales}
        totalItems={totalItems}
        avgDailySales={avgDailySales}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart data={salesChartData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={categoryChartData} />
            <TopProducts products={topProductsData} />
          </div>
        </div>
        
        <div className="space-y-6">
          <RealtimeActivityFeed />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics Summary</span>
              </CardTitle>
              <CardDescription>Key metrics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Total Days Tracked</span>
                <Badge variant="secondary">{salesAnalytics?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Products Sold</span>
                <Badge variant="secondary">{productAnalytics?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Categories Active</span>
                <Badge variant="secondary">{categoryAnalytics?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
