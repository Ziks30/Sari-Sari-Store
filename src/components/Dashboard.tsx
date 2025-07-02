
import KPICards from './dashboard/KPICards';
import SalesChart from './dashboard/SalesChart';
import CategoryChart from './dashboard/CategoryChart';
import TopProducts from './dashboard/TopProducts';
import AIInsights from './dashboard/AIInsights';
import SeedDatabaseButton from './SeedDatabaseButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RecommendationEngine } from '@/utils/recommendationEngine';
import { useMemo } from 'react';

const Dashboard = () => {
  const { salesAnalytics, productAnalytics, categoryAnalytics, isLoading } = useAnalytics();
  const recommendationEngine = new RecommendationEngine();

  // Transform analytics data for charts
  const salesData = useMemo(() => {
    return salesAnalytics.slice(0, 7).reverse().map(item => ({
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: Number(item.total_sales),
      items: item.total_items
    }));
  }, [salesAnalytics]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    
    categoryAnalytics.forEach(item => {
      const categoryName = item.categories?.name || 'Unknown';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          category: categoryName,
          sales: 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
      }
      
      const existing = categoryMap.get(categoryName);
      existing.sales += Number(item.total_sales);
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [categoryAnalytics]);

  const topProducts = useMemo(() => {
    const productMap = new Map();
    
    productAnalytics.forEach(item => {
      const productName = item.products?.name || 'Unknown';
      if (!productMap.has(item.product_id)) {
        productMap.set(item.product_id, {
          name: productName,
          sold: 0,
          revenue: 0
        });
      }
      
      const existing = productMap.get(item.product_id);
      existing.sold += item.quantity_sold;
      existing.revenue += Number(item.revenue);
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [productAnalytics]);

  // Generate ML recommendations
  const recommendations = useMemo(() => {
    if (!productAnalytics.length || !salesAnalytics.length) return [];

    const productData = productAnalytics.map(item => ({
      product_id: item.product_id,
      name: item.products?.name || 'Unknown',
      quantity_sold: item.quantity_sold,
      revenue: Number(item.revenue),
      current_stock: item.products?.current_stock || 0,
      minimum_stock: item.products?.minimum_stock || 0,
      date: item.date
    }));

    const salesData = salesAnalytics.map(item => ({
      date: item.date,
      total_sales: Number(item.total_sales),
      total_items: item.total_items,
      total_transactions: item.total_transactions
    }));

    const categoryData = categoryAnalytics.map(item => ({
      category_id: item.category_id,
      name: item.categories?.name || 'Unknown',
      total_sales: Number(item.total_sales),
      total_items: item.total_items,
      date: item.date
    }));

    return recommendationEngine.generateRecommendations(productData, salesData, categoryData);
  }, [productAnalytics, salesAnalytics, categoryAnalytics, recommendationEngine]);

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = salesData.length > 0 ? Math.round(totalSales / salesData.length) : 0;
  const totalItems = salesData.reduce((sum, day) => sum + day.items, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Always show seed database button at the top for easy access */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Database Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 mb-2">
                {salesAnalytics.length === 0 
                  ? "No transaction data found. Click to add sample data for testing." 
                  : "Add more sample transaction data to enhance analytics."}
              </p>
              <p className="text-sm text-blue-600">
                Current transactions: {salesAnalytics.length > 0 ? `${salesAnalytics.length} days of data` : 'None'}
              </p>
            </div>
            <SeedDatabaseButton />
          </div>
        </CardContent>
      </Card>

      <KPICards 
        totalSales={totalSales}
        totalItems={totalItems}
        avgDailySales={avgDailySales}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} />
        <CategoryChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={topProducts} />
        <AIInsights recommendations={recommendations} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                rec.priority === 'High' 
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                  : rec.priority === 'Medium'
                  ? 'bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {rec.icon === 'Package' && <Package className="w-5 h-5 text-blue-600" />}
                  {rec.icon === 'TrendingUp' && <TrendingUp className="w-5 h-5 text-green-600" />}
                  {rec.icon === 'AlertTriangle' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                  <span className={`font-medium ${
                    rec.priority === 'High' ? 'text-red-800' :
                    rec.priority === 'Medium' ? 'text-blue-800' : 'text-green-800'
                  }`}>{rec.type}</span>
                </div>
                <p className={`text-sm ${
                  rec.priority === 'High' ? 'text-red-700' :
                  rec.priority === 'Medium' ? 'text-blue-700' : 'text-green-700'
                }`}>{rec.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
