import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesAnalytics {
  id: string;
  date: string;
  total_sales: number;
  total_items: number;
  total_transactions: number;
}

export interface ProductSalesAnalytics {
  id: string;
  product_id: string;
  date: string;
  quantity_sold: number;
  revenue: number;
  products?: {
    name: string;
    current_stock: number;
    minimum_stock: number;
  };
}

export interface CategorySalesAnalytics {
  id: string;
  category_id: string;
  date: string;
  total_sales: number;
  total_items: number;
  categories?: {
    name: string;
  };
}

export const useAnalytics = () => {
  // Fetch sales data and transform to analytics format
  const {
    data: salesAnalytics = [],
    isLoading: salesLoading,
  } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            quantity,
            total_price
          )
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      console.log('SALES RAW:', data, error);
      if (error) throw error;

      // Transform sales data to daily analytics
      const dailyMap = new Map();
      (data || []).forEach(sale => {
        if (!sale?.created_at) return;
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        const totalItems = Array.isArray(sale.sale_items)
          ? sale.sale_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
          : 0;

        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            id: date,
            date,
            total_sales: 0,
            total_items: 0,
            total_transactions: 0
          });
        }

        const dayData = dailyMap.get(date);
        dayData.total_sales += Number(sale.total_amount) || 0;
        dayData.total_items += totalItems;
        dayData.total_transactions += 1;
      });

      const result = Array.from(dailyMap.values()) as SalesAnalytics[];
      console.log('SALES ANALYTICS:', result);
      return result;
    },
  });

  // Fetch product sales analytics
  const {
    data: productAnalytics = [],
    isLoading: productLoading,
  } = useQuery({
    queryKey: ['product-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          *,
          sales (
            created_at
          ),
          products (
            name,
            current_stock,
            minimum_stock
          )
        `)
        .order('sales.created_at', { ascending: false });

      console.log('PRODUCTS RAW:', data, error);
      if (error) throw error;

      // Transform to product analytics format
      const productMap = new Map();
      (data || []).forEach((item: any) => {
        if (!item?.sales?.created_at || !item.products) return;
        const date = new Date(item.sales.created_at).toISOString().split('T')[0];
        const key = `${item.product_id}-${date}`;

        if (!productMap.has(key)) {
          productMap.set(key, {
            id: key,
            product_id: item.product_id,
            date,
            quantity_sold: 0,
            revenue: 0,
            products: item.products
          });
        }

        const productData = productMap.get(key);
        productData.quantity_sold += item.quantity || 0;
        productData.revenue += Number(item.total_price) || 0;
      });

      const result = Array.from(productMap.values()).slice(0, 100) as ProductSalesAnalytics[];
      console.log('PRODUCT ANALYTICS:', result);
      return result;
    },
  });

  // Fetch category sales analytics
  const {
    data: categoryAnalytics = [],
    isLoading: categoryLoading,
  } = useQuery({
    queryKey: ['category-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          *,
          sales (
            created_at
          ),
          products (
            category_id,
            categories (
              name
            )
          )
        `)
        .order('sales.created_at', { ascending: false });

      console.log('CATEGORIES RAW:', data, error);
      if (error) throw error;

      // Transform to category analytics format
      const categoryMap = new Map();
      (data || []).forEach((item: any) => {
        if (!item?.sales?.created_at || !item.products?.category_id) return;
        const date = new Date(item.sales.created_at).toISOString().split('T')[0];
        const key = `${item.products.category_id}-${date}`;

        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            id: key,
            category_id: item.products.category_id,
            date,
            total_sales: 0,
            total_items: 0,
            categories: item.products.categories
          });
        }

        const categoryData = categoryMap.get(key);
        categoryData.total_sales += Number(item.total_price) || 0;
        categoryData.total_items += item.quantity || 0;
      });

      const result = Array.from(categoryMap.values()).slice(0, 50) as CategorySalesAnalytics[];
      console.log('CATEGORY ANALYTICS:', result);
      return result;
    },
  });

  return {
    salesAnalytics,
    productAnalytics,
    categoryAnalytics,
    isLoading: salesLoading || productLoading || categoryLoading,
  };
};