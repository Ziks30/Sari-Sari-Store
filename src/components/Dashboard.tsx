import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import KPICards from './dashboard/KPICards';
import SalesChart from './dashboard/SalesChart';
import CategoryChart from './dashboard/CategoryChart';
import TopProducts from './dashboard/TopProducts';
import TopProfitableProducts from './dashboard/TopProfitableProducts';
import RealtimeActivityFeed from './analytics/RealtimeActivityFeed';
import LowStockAlert from './inventory/LowStockAlert';
import { useProducts } from '@/hooks/useProducts';

const Dashboard = () => {
  const { 
    salesAnalytics, 
    productAnalytics, 
    categoryAnalytics, 
    profitAnalytics, 
    isLoading, 
    refreshAnalytics 
  } = useRealtimeAnalytics();
  
  const { products } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-pulse" />
          <div className="text-lg">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  // KPI Calculator para sa analytics
  const totalSales = salesAnalytics?.reduce((sum, day) => sum + day.total_sales, 0) || 0;
  const totalItems = salesAnalytics?.reduce((sum, day) => sum + day.total_items, 0) || 0;
  const avgDailySales = salesAnalytics?.length > 0 ? totalSales / salesAnalytics.length : 0;

  const totalProfit = profitAnalytics?.reduce((sum, prod) => sum + prod.profit, 0) || 0;
  const lowProfitProducts = (profitAnalytics || []).filter(p => p.profit <= 0);

  const salesChartData = (salesAnalytics || []).slice(-7).reverse().map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: day.total_sales,
    items: day.total_items
  }));

  // Category Data
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

  // Top Products
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

  // DCSNTR Alert
  const lowStockItems = (products || []).filter(product => 
    product.current_stock <= product.minimum_stock
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-green-500" />
              <span>Real-time Analytics</span>
            </Badge>
            <p className="text-sm text-gray-600">
              Data updates automatically with new transactions
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

      {lowStockItems.length > 0 && (
        <LowStockAlert lowStockItems={lowStockItems} />
      )}

      <KPICards 
        totalSales={totalSales}
        totalItems={totalItems}
        avgDailySales={avgDailySales}
        totalProfit={totalProfit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart data={salesChartData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={categoryChartData} />
            <TopProducts products={topProductsData} />
          </div>
          <TopProfitableProducts products={profitAnalytics} />

          {lowProfitProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <AlertTriangle className="w-5 h-5 text-red-500 inline mr-2" />
                  Low/Negative Profit Products
                </CardTitle>
                <CardDescription>
                  These products generated little or negative profit. Review pricing or consider discontinuing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  {lowProfitProducts.map(prod => (
                    <li key={prod.name} className="flex justify-between text-red-600">
                      <span>{prod.name} ({prod.category})</span>
                      <span>₱{prod.profit.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <RealtimeActivityFeed />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
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
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Low Stock Items</span>
                <Badge variant={lowStockItems.length > 0 ? "destructive" : "secondary"}>
                  {lowStockItems.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium">Total Profit</span>
                <Badge variant="secondary">
                  ₱{totalProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;