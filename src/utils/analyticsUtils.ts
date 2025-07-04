import { SalesAnalytics, ProductSalesAnalytics, CategorySalesAnalytics } from '@/hooks/useAnalytics';

export const transformSalesToDailyAnalytics = (salesData: any[]): SalesAnalytics[] => {
  const dailyMap = new Map();
  
  salesData?.forEach(sale => {
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    const totalItems = sale.sale_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    
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
    dayData.total_sales += Number(sale.total_amount);
    dayData.total_items += totalItems;
    dayData.total_transactions += 1;
  });

  return Array.from(dailyMap.values());
};

export const transformProductAnalytics = (productData: any[]): ProductSalesAnalytics[] => {
  const productMap = new Map();
  
  productData?.forEach((item: any) => {
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
    productData.quantity_sold += item.quantity;
    productData.revenue += Number(item.total_price);
  });

  return Array.from(productMap.values());
};

export const transformCategoryAnalytics = (categoryData: any[]): CategorySalesAnalytics[] => {
  const categoryMap = new Map();
  
  categoryData?.forEach((item: any) => {
    if (!item.products?.category_id) return;
    
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
    categoryData.total_sales += Number(item.total_price);
    categoryData.total_items += item.quantity;
  });

  return Array.from(categoryMap.values());
};