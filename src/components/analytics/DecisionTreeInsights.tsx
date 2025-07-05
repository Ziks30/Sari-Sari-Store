import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// These interfaces remain the same, but we'll derive data from the new schema tables
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
  const [localCreditRisks, setLocalCreditRisks] = useState<CreditRisk[]>(creditRisks);
  const [localStockAlerts, setLocalStockAlerts] = useState<StockAlert[]>(stockAlerts);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
      default:
        return 'default';
    }
  };

  // Example function to determine risk level based on overdueDays
  const determineRiskLevel = (overdueDays: number) => {
    if (overdueDays > 30) return 'High';
    if (overdueDays > 7) return 'Medium';
    return 'Low';
  };

  const getRecommendation = (riskLevel: string) => {
    if (riskLevel === 'High') return 'Review credit policy and contact customer immediately.';
    if (riskLevel === 'Medium') return 'Send a friendly reminder to settle overdue amount.';
    return 'Monitor closely for upcoming due dates.';
  };
  const fetchData = async () => {
    try {
      const now = new Date();
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('id, customer_id, amount, due_date, status, customers ( name, total_credit )')
        .neq('status', 'paid');

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
      } else if (creditsData) {
        const grouped = new Map<string, CreditRisk>();
        creditsData.forEach((row: any) => {
          const overdue = row.due_date ? (now.getTime() - new Date(row.due_date).getTime()) / (1000 * 60 * 60 * 24) : 0;
          const overdueDays = overdue > 0 ? Math.floor(overdue) : 0;
          const key = row.customer_id;
          if (!grouped.has(key)) {
            grouped.set(key, {
              customer_id: row.customer_id,
              customer_name: row.customers?.name || 'Unknown Customer',
              total_credit: Number(row.customers?.total_credit || 0),
              overdue_days: overdueDays,
              risk_level: determineRiskLevel(overdueDays),
              recommendation: getRecommendation(determineRiskLevel(overdueDays))
            });
          } else {
            const existing = grouped.get(key)!;
            existing.overdue_days = Math.max(existing.overdue_days, overdueDays);
            const newRisk = determineRiskLevel(existing.overdue_days);
            existing.risk_level = newRisk;
            existing.recommendation = getRecommendation(newRisk);
          }
        });
        setLocalCreditRisks(Array.from(grouped.values()));
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else if (productsData) {
        const alerts: StockAlert[] = productsData.map((product: any) => {
          const { id, name, current_stock, minimum_stock } = product;
          const salesVelocity = 2;
          const daysUntilStockout = salesVelocity > 0 ? Math.floor(current_stock / salesVelocity) : 9999;
          let urgency: StockAlert['urgency'] = 'Low';
          if (current_stock <= minimum_stock) {
            urgency = 'High';
          } else if (daysUntilStockout < 5) {
            urgency = 'Medium';
          }

          return {
            product_id: id,
            product_name: name,
            current_stock,
            minimum_stock,
            sales_velocity: salesVelocity,
            days_until_stockout: daysUntilStockout,
            urgency
          };
        });
        setLocalStockAlerts(alerts);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const creditsSubscription = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(creditsSubscription);
      supabase.removeChannel(productsSubscription);
    };
  }, []);

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
          {localCreditRisks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No credit risks detected</p>
              <p className="text-sm">All customers are within safe credit limits</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localCreditRisks.map((risk) => (
                <div
                  key={risk.customer_id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{risk.customer_name}</p>
                      <p className="text-sm text-gray-600">
                        ₱{risk.total_credit.toLocaleString()} credit
                      </p>
                    </div>
                    <Badge variant={getRiskColor(risk.risk_level)}>
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
          {localStockAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>All products well-stocked</p>
              <p className="text-sm">No immediate restocking needed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localStockAlerts.map((alert) => (
                <div
                  key={alert.product_id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{alert.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {alert.current_stock} units left (min: {alert.minimum_stock})
                      </p>
                    </div>
                    <Badge variant={getRiskColor(alert.urgency)}>
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
                        : 'Monitor stock levels closely'}
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