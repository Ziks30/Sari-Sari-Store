
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'sale' | 'transaction';
  message: string;
  timestamp: string;
  amount?: number;
  status: 'success' | 'info';
}

const RealtimeActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const addActivity = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  };

  useEffect(() => {
    // Fetch recent sales for initial activity feed
    const fetchRecentSales = async () => {
      const { data: recentSales } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSales) {
        const initialActivities = recentSales.map(sale => ({
          id: sale.id,
          type: 'sale' as const,
          message: `Sale completed for ₱${Number(sale.total_amount).toLocaleString()}`,
          timestamp: sale.created_at,
          amount: Number(sale.total_amount),
          status: 'success' as const
        }));
        setActivities(initialActivities);
      }
    };

    fetchRecentSales();

    // Set up real-time subscription
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          const sale = payload.new as any;
          addActivity({
            id: sale.id,
            type: 'sale',
            message: `New sale completed for ₱${Number(sale.total_amount).toLocaleString()}`,
            timestamp: sale.created_at,
            amount: Number(sale.total_amount),
            status: 'success'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <span>Live Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Clock className="w-8 h-8 mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={activity.status === 'success' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-sm font-bold">
                        +₱{activity.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimeActivityFeed;
