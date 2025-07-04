
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Package, Target } from 'lucide-react';

interface CreditRisk {
  customer_id: string;
  customer_name: string;
  total_credit: number;
  overdue_days: number;
  risk_level: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  minimum_stock: number;
  sales_velocity: number;
  days_until_stockout: number;
  urgency: 'Low' | 'Medium' | 'High';
}

interface DecisionTreeInsightsProps {
  creditRisks?: CreditRisk[];
  stockAlerts?: StockAlert[];
}

const DecisionTreeInsights = ({ creditRisks = [], stockAlerts = [] }: DecisionTreeInsightsProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Credit Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Credit Risk Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditRisks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No credit risks detected</p>
              <p className="text-sm">All customers are within safe credit limits</p>
            </div>
          ) : (
            <div className="space-y-4">
              {creditRisks.map((risk, index) => (
                <div key={risk.customer_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{risk.customer_name}</p>
                      <p className="text-sm text-gray-600">₱{risk.total_credit.toLocaleString()} credit</p>
                    </div>
                    <Badge variant={getRiskColor(risk.risk_level) as any}>
                      {risk.risk_level} Risk
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{risk.overdue_days} days overdue</span>
                  </div>
                  <p className="text-sm bg-blue-50 p-2 rounded text-blue-800">
                    {risk.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Alert Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span>Smart Stock Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stockAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>All products well-stocked</p>
              <p className="text-sm">No immediate restocking needed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stockAlerts.map((alert, index) => (
                <div key={alert.product_id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{alert.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {alert.current_stock} units left (min: {alert.minimum_stock})
                      </p>
                    </div>
                    <Badge variant={getRiskColor(alert.urgency) as any}>
                      {alert.urgency}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{alert.sales_velocity} units/day</span>
                    <span>~{alert.days_until_stockout} days remaining</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm bg-orange-50 p-2 rounded text-orange-800">
                    <Target className="w-3 h-3" />
                    <span>
                      {alert.urgency === 'High' 
                        ? 'Restock immediately to avoid stockout'
                        : alert.urgency === 'Medium'
                        ? 'Plan restocking within next few days'
                        : 'Monitor stock levels closely'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DecisionTreeInsights;