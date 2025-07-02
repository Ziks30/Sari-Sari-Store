
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Package, Users, TrendingUp, Target, AlertTriangle, TrendingDown } from 'lucide-react';

interface Recommendation {
  type: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  icon: string;
}

interface AIInsightsProps {
  recommendations?: Recommendation[];
}

const AIInsights = ({ recommendations = [] }: AIInsightsProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return <Package className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'TrendingDown': return <TrendingDown className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
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
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No insights available yet.</p>
              <p className="text-sm">Add some sales data to get AI-powered recommendations.</p>
            </div>
          ) : (
            recommendations.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-purple-600">
                      {getIcon(insight.icon)}
                    </div>
                    <span className="font-medium text-sm">{insight.type}</span>
                  </div>
                  <Badge variant={getPriorityColor(insight.priority) as any}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
