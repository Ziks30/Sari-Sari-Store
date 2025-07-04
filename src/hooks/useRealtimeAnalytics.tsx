
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

  const [profitAnalytics, setProfitAnalytics] = useState<any[]>([]);

  const computeProfitAnalytics = async () => {
    // Fetch sale_items joined with products (for cost price)
    const { data: saleItems, error } = await supabase
      .from('sale_items')
      .select(`
        id, sale_id, product_id, quantity, unit_price, total_price,
        products (name, category_id, cost_price, unit_price)
      `);
  
    // Fetch categories for later grouping
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');
  
    // Map for category names
    const categoryMap = Object.fromEntries((categories || []).map(c => [c.id, c.name]));
  
    // Calculate profit per item, aggregate by product & category
    const productProfits: Record<string, { name: string, profit: number, quantity: number, category: string }> = {};
    for (const item of (saleItems || [])) {
      const cost = item.products?.cost_price ?? 0;
      const price = item.unit_price ?? 0;
      const qty = item.quantity ?? 0;
      const profit = (price - cost) * qty;
      const productName = item.products?.name ?? 'Unknown';
      const categoryId = item.products?.category_id ?? '';
      const categoryName = categoryMap[categoryId] ?? 'Uncategorized';
  
      if (!productProfits[item.product_id]) {
        productProfits[item.product_id] = { name: productName, profit: 0, quantity: 0, category: categoryName };
      }
      productProfits[item.product_id].profit += profit;
      productProfits[item.product_id].quantity += qty;
    }
  
    // Convert to array, sort by profit
    const profitArray = Object.values(productProfits).sort((a, b) => b.profit - a.profit);
  
    setProfitAnalytics(profitArray);
  };
  
  // In your useEffect, call computeProfitAnalytics on data change
  useEffect(() => {
    // ...existing fetches
    computeProfitAnalytics();
  }, [/* dependencies: salesAnalytics, saleItems, etc. */]);

  return {
    salesAnalytics,
    productAnalytics,
    categoryAnalytics,
    isLoading,
    profitAnalytics,
    refreshAnalytics: fetchInitialData
  };
};