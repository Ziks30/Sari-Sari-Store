
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  lastRestocked: string;
  barcode?: string;
  description?: string;
}

interface InventoryStatsProps {
  inventory: Product[];
  lowStockItems: Product[];
  outOfStockItems: Product[];
}

const InventoryStats = ({ inventory, lowStockItems, outOfStockItems }: InventoryStatsProps) => {
  const totalValue = inventory.reduce((total, item) => total + (item.price * item.stock), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{inventory.length}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                ₱{totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStats;
