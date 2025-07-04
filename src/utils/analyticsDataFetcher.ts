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

  if (salesError) throw salesError;
  return transformSalesToDailyAnalytics(salesData || []);
};

export const fetchProductAnalytics = async () => {
  const { data: productData, error: productError } = await supabase
    .from('sale_items')
    .select(`
      *,
      sales!inner (
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

  if (productError) throw productError;
  return transformProductAnalytics(productData || []);
};

export const fetchCategoryAnalytics = async () => {
  const { data: categoryData, error: categoryError } = await supabase
    .from('sale_items')
    .select(`
      *,
      sales!inner (
        created_at
      ),
      products!inner (
        category_id,
        categories (
          name
        )
      )
    `)
    .not('products.category_id', 'is', null)
    .order('sales.created_at', { ascending: false })
    .limit(150);

  if (categoryError) throw categoryError;
  return transformCategoryAnalytics(categoryData || []);
};