import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import POSInterface from '@/components/POSInterface';
import InventoryManagement from '@/components/InventoryManagement';
import Dashboard from '@/components/Dashboard';
import UtangManagement from '@/components/UtangManagement';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [todaySales, setTodaySales] = useState<number>(0);

  useEffect(() => {
    const fetchTodaySales = async () => {
      try {
        // Calculate start and end of today in UTC
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Query 'transactions' or your relevant table where the transaction was made today
        // Adjust your table and field names accordingly
        const { data, error } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        if (error) {
          console.error('Error fetching today sales:', error);
          return;
        }

        // Sum the amounts
        const totalSalesToday = (data || []).reduce(
          (sum: number, row: any) => sum + (row.total_amount || 0),
          0
        );

        setTodaySales(totalSalesToday);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchTodaySales();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SariSense</h1>
                <p className="text-sm text-gray-600">Smart Sari-Sari Store Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-xl font-bold text-teal-600">₱{todaySales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pos" className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">POS</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="utang" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Utang</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

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
            <Dashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;