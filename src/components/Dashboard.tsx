
import KPICards from './dashboard/KPICards';
import SalesChart from './dashboard/SalesChart';
import CategoryChart from './dashboard/CategoryChart';
import TopProducts from './dashboard/TopProducts';
import AIInsights from './dashboard/AIInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';

const salesData = [
  { day: 'Mon', sales: 2400, items: 45 },
  { day: 'Tue', sales: 1800, items: 35 },
  { day: 'Wed', sales: 3200, items: 58 },
  { day: 'Thu', sales: 2800, items: 52 },
  { day: 'Fri', sales: 3800, items: 65 },
  { day: 'Sat', sales: 4200, items: 72 },
  { day: 'Sun', sales: 3600, items: 61 },
];

const categoryData = [
  { category: 'Beverages', sales: 8500, color: '#0ea5e9' },
  { category: 'Snacks', sales: 6200, color: '#22c55e' },
  { category: 'Noodles', sales: 4800, color: '#f59e0b' },
  { category: 'Household', sales: 3200, color: '#ef4444' },
  { category: 'Canned Goods', sales: 2100, color: '#8b5cf6' },
];

const topProducts = [
  { name: 'Coca Cola 8oz', sold: 156, revenue: 2340 },
  { name: 'Lucky Me Pancit Canton', sold: 128, revenue: 2304 },
  { name: 'Rebisco Crackers', sold: 98, revenue: 2450 },
  { name: 'Bear Brand Milk', sold: 87, revenue: 1914 },
  { name: 'Tide Detergent Sachet', sold: 156, revenue: 1248 },
];

const Dashboard = () => {
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = Math.round(totalSales / salesData.length);
  const totalItems = salesData.reduce((sum, day) => sum + day.items, 0);

  return (
    <div className="space-y-6">
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
        <AIInsights />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Restock Alert</span>
              </div>
              <p className="text-sm text-blue-700">3 items need immediate restocking based on ML predictions</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Upsell Opportunity</span>
              </div>
              <p className="text-sm text-green-700">Suggest beverages to customers buying noodles for 15% sales boost</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Payment Follow-up</span>
              </div>
              <p className="text-sm text-orange-700">2 high-risk customers need immediate payment follow-up</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
