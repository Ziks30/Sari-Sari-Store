
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { DbProduct } from '@/types/inventory';

interface LowStockAlertProps {
  lowStockItems: DbProduct[];
}

const LowStockAlert = ({ lowStockItems }: LowStockAlertProps) => {
  if (lowStockItems.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Low Stock Alert</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 mb-3">The following items need restocking:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {lowStockItems.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-lg border">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">Current: {item.current_stock} | Min: {item.minimum_stock}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
