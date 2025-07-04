import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SalesAnalytics, ProductSalesAnalytics, CategorySalesAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsState {
  setSalesAnalytics: React.Dispatch<React.SetStateAction<SalesAnalytics[]>>;
  setProductAnalytics: React.Dispatch<React.SetStateAction<ProductSalesAnalytics[]>>;
  setCategoryAnalytics: React.Dispatch<React.SetStateAction<CategorySalesAnalytics[]>>;
}

export const useAnalyticsUpdates = ({
  setSalesAnalytics,
  setProductAnalytics,
  setCategoryAnalytics
}: AnalyticsState) => {
  const { toast } = useToast();

  const updateAnalyticsFromSale = useCallback(async (saleData: any) => {
    const saleDate = new Date(saleData.created_at).toISOString().split('T')[0];
    
    // Fetch sale items for this sale
    const { data: saleItems } = await supabase
      .from('sale_items')
      .select(`
        *,
        products (
          name,
          current_stock,
          minimum_stock,
          category_id,
          categories (
            name
          )
        )
      `)
      .eq('sale_id', saleData.id);

    if (!saleItems) return;

    const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);

    // Update sales analytics
    setSalesAnalytics(prev => {
      const newAnalytics = [...prev];
      const existingIndex = newAnalytics.findIndex(item => item.date === saleDate);
      
      if (existingIndex >= 0) {
        newAnalytics[existingIndex] = {
          ...newAnalytics[existingIndex],
          total_sales: newAnalytics[existingIndex].total_sales + Number(saleData.total_amount),
          total_items: newAnalytics[existingIndex].total_items + totalItems,
          total_transactions: newAnalytics[existingIndex].total_transactions + 1
        };
      } else {
        newAnalytics.unshift({
          id: saleDate,
          date: saleDate,
          total_sales: Number(saleData.total_amount),
          total_items: totalItems,
          total_transactions: 1
        });
      }
      
      return newAnalytics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Update product analytics
    saleItems.forEach(item => {
      const key = `${item.product_id}-${saleDate}`;
      
      setProductAnalytics(prev => {
        const newAnalytics = [...prev];
        const existingIndex = newAnalytics.findIndex(p => p.id === key);
        
        if (existingIndex >= 0) {
          newAnalytics[existingIndex] = {
            ...newAnalytics[existingIndex],
            quantity_sold: newAnalytics[existingIndex].quantity_sold + item.quantity,
            revenue: newAnalytics[existingIndex].revenue + Number(item.total_price)
          };
        } else {
          newAnalytics.push({
            id: key,
            product_id: item.product_id,
            date: saleDate,
            quantity_sold: item.quantity,
            revenue: Number(item.total_price),
            products: item.products
          });
        }
        
        return newAnalytics;
      });

      // Update category analytics
      if (item.products?.category_id) {
        const categoryKey = `${item.products.category_id}-${saleDate}`;
        
        setCategoryAnalytics(prev => {
          const newAnalytics = [...prev];
          const existingIndex = newAnalytics.findIndex(c => c.id === categoryKey);
          
          if (existingIndex >= 0) {
            newAnalytics[existingIndex] = {
              ...newAnalytics[existingIndex],
              total_sales: newAnalytics[existingIndex].total_sales + Number(item.total_price),
              total_items: newAnalytics[existingIndex].total_items + item.quantity
            };
          } else {
            newAnalytics.push({
              id: categoryKey,
              category_id: item.products.category_id,
              date: saleDate,
              total_sales: Number(item.total_price),
              total_items: item.quantity,
              categories: item.products.categories
            });
          }
          
          return newAnalytics;
        });
      }
    });

    toast({
      title: "Analytics Updated",
      description: "Real-time analytics have been updated with the new transaction",
    });
  }, [setSalesAnalytics, setProductAnalytics, setCategoryAnalytics, toast]);

  return { updateAnalyticsFromSale };
};