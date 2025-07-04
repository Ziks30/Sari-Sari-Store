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
    .order('created_at', { ascending: false })
    .limit(100);

  console.log('SALES DATA:', salesData, salesError);

  if (salesError) throw salesError;
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
    .order('sales.created_at', { ascending: false })
    .limit(200);

  console.log('PRODUCT DATA:', productData, productError);

  if (productError) throw productError;
  const result = transformProductAnalytics(productData || []);
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
    .order('sales.created_at', { ascending: false })
    .limit(150);

  console.log('CATEGORY DATA:', categoryData, categoryError);

  if (categoryError) throw categoryError;
  const result = transformCategoryAnalytics(categoryData || []);
  console.log('TRANSFORMED CATEGORY ANALYTICS:', result);
  return result;
};