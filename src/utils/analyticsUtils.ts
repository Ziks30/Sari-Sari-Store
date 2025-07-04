import { SalesAnalytics, ProductSalesAnalytics, CategorySalesAnalytics } from '@/hooks/useAnalytics';

export const transformSalesToDailyAnalytics = (salesData: any[]): SalesAnalytics[] => {
  const dailyMap = new Map();

  salesData?.forEach(sale => {
    if (!sale || !sale.created_at) return; // Defensive
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
        total_transactions: 0,
      });
    }

    const dayData = dailyMap.get(date);
    dayData.total_sales += Number(sale.total_amount) || 0;
    dayData.total_items += totalItems;
    dayData.total_transactions += 1;
  });

  const result = Array.from(dailyMap.values());
  console.log('TRANSFORM: Daily sales analytics result:', result);
  return result;
};

export const transformProductAnalytics = (productData: any[]): ProductSalesAnalytics[] => {
  const productMap = new Map();

  productData?.forEach((item: any) => {
    if (!item || !item.sales || !item.sales.created_at) return;
    if (!item.products) return;

    const date = new Date(item.sales.created_at).toISOString().split('T')[0];
    const key = `${item.product_id}-${date}`;

    if (!productMap.has(key)) {
      productMap.set(key, {
        id: key,
        product_id: item.product_id,
        date,
        quantity_sold: 0,
        revenue: 0,
        products: item.products,
      });
    }

    const prod = productMap.get(key);
    prod.quantity_sold += item.quantity || 0;
    prod.revenue += Number(item.total_price) || 0;
  });

  const result = Array.from(productMap.values());
  console.log('TRANSFORM: Product analytics result:', result);
  return result;
};

export const transformCategoryAnalytics = (categoryData: any[]): CategorySalesAnalytics[] => {
  const categoryMap = new Map();

  categoryData?.forEach((item: any) => {
    if (!item || !item.sales || !item.sales.created_at) return;
    if (!item.products || !item.products.category_id) return;

    const date = new Date(item.sales.created_at).toISOString().split('T')[0];
    const key = `${item.products.category_id}-${date}`;

    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        id: key,
        category_id: item.products.category_id,
        date,
        total_sales: 0,
        total_items: 0,
        categories: item.products.categories || { name: 'Unknown' },
      });
    }

    const cat = categoryMap.get(key);
    cat.total_sales += Number(item.total_price) || 0;
    cat.total_items += item.quantity || 0;
  });

  const result = Array.from(categoryMap.values());
  console.log('TRANSFORM: Category analytics result:', result);
  return result;
};