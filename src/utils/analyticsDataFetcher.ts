import { supabase } from '@/integrations/supabase/client';
import { transformSalesToDailyAnalytics, transformProductAnalytics, transformCategoryAnalytics } from './analyticsUtils';

export const fetchSalesAnalytics = async () => {
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        quantity,
        total_price
      )
    `)
    .limit(100);

  if (salesError) {
    console.error('Sales analytics error:', salesError);
    throw salesError;
  }
  console.log('SALES DATA:', salesData);

  const result = transformSalesToDailyAnalytics(salesData || []);
  console.log('TRANSFORMED SALES ANALYTICS:', result);

  return result;
};

export const fetchProductAnalytics = async () => {
  const { data: productData, error: productError } = await supabase
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
    .limit(200);

  if (productError) {
    console.error('Product analytics error:', productError);
    throw productError;
  }
  console.log('PRODUCT DATA:', productData);

  const sorted = (productData || []).sort((a, b) =>
    new Date(a.sales?.created_at || 0).getTime() - new Date(b.sales?.created_at || 0).getTime()
  );

  const result = transformProductAnalytics(sorted);
  console.log('TRANSFORMED PRODUCT ANALYTICS:', result);
  return result;
};

export const fetchCategoryAnalytics = async () => {
  const { data: categoryData, error: categoryError } = await supabase
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
    .limit(150);

  if (categoryError) {
    console.error('Category analytics error:', categoryError);
    throw categoryError;
  }
  console.log('CATEGORY DATA:', categoryData);

  const sorted = (categoryData || []).sort((a, b) =>
    new Date(a.sales?.created_at || 0).getTime() - new Date(b.sales?.created_at || 0).getTime()
  );

  const result = transformCategoryAnalytics(sorted);
  console.log('TRANSFORMED CATEGORY ANALYTICS:', result);
  return result;
};