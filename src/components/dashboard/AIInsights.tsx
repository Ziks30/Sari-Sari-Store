
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Package, Users, TrendingUp, Target } from 'lucide-react';

interface MLInsight {
  type: string;
  message: string;
  priority: string;
  icon: React.ReactNode;
}

const mlInsights: MLInsight[] = [
  {
    type: 'Stock Prediction',
    message: 'Coca Cola 8oz will run out in 3 days based on current sales trend',
    priority: 'High',
    icon: <Package className="w-4 h-4" />,
  },
  {
    type: 'Customer Behavior',
    message: 'Customers buying noodles are 78% likely to also buy beverages',
    priority: 'Medium',
    icon: <Users className="w-4 h-4" />,
  },
  {
    type: 'Sales Forecast',
    message: 'Weekend sales expected to increase by 15% - stock up on snacks',
    priority: 'Medium',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    type: 'Peak Day Alert',
    message: 'Friday typically shows highest sales (₱4,200 avg) - prepare extra staff',
    priority: 'Low',
    icon: <Target className="w-4 h-4" />,
  },
];

const AIInsights = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI-Powered Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mlInsights.map((insight, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-purple-600">
                    {insight.icon}
                  </div>
                  <span className="font-medium text-sm">{insight.type}</span>
                </div>
                <Badge variant={getPriorityColor(insight.priority) as any}>
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{insight.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
