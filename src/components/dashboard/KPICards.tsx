import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, Target, DollarSign } from 'lucide-react';

export interface KPICardsProps {
  totalSales: number;
  totalItems: number;
  avgDailySales: number;
  totalProfit?: number;
}

const KPICards = ({ totalSales, totalItems, avgDailySales, totalProfit }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">₱{totalSales.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Weekly Sales</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-sm text-gray-600">Items Sold</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+8%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">₱4,730</p>
              <p className="text-sm text-gray-600">Total Utang</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-600">-5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">₱{avgDailySales.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Avg Daily Sales</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+15%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">
                ₱{(totalProfit ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-600">Total Profit</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+10%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;