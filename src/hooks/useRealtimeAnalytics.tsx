
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SalesAnalytics, ProductSalesAnalytics, CategorySalesAnalytics } from '@/hooks/useAnalytics';
import { fetchSalesAnalytics, fetchProductAnalytics, fetchCategoryAnalytics } from '@/utils/analyticsDataFetcher';
import { useAnalyticsUpdates } from './useAnalyticsUpdates';

export const useRealtimeAnalytics = () => {
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductSalesAnalytics[]>([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategorySalesAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { updateAnalyticsFromSale } = useAnalyticsUpdates({
    setSalesAnalytics,
    setProductAnalytics,
    setCategoryAnalytics
  });

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [salesData, productData, categoryData] = await Promise.all([
        fetchSalesAnalytics(),
        fetchProductAnalytics(),
        fetchCategoryAnalytics()
      ]);

      setSalesAnalytics(salesData);
      setProductAnalytics(productData);
      setCategoryAnalytics(categoryData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Set up real-time subscription for sales
    const salesChannel = supabase
      .channel('sales-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          console.log('New sale detected:', payload.new);
          updateAnalyticsFromSale(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
    };
  }, [updateAnalyticsFromSale]);

  return {
    salesAnalytics,
    productAnalytics,
    categoryAnalytics,
    isLoading,
    refreshAnalytics: fetchInitialData
  };
};