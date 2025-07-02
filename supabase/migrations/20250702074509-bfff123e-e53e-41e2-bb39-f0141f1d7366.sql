
-- Create sales analytics table for aggregated daily sales data
CREATE TABLE public.sales_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_sales DECIMAL NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create product sales analytics table for tracking product performance
CREATE TABLE public.product_sales_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

-- Create category sales analytics table
CREATE TABLE public.category_sales_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  date DATE NOT NULL,
  total_sales DECIMAL NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, date)
);

-- Enable RLS on all analytics tables
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_sales_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables
CREATE POLICY "Users can view sales analytics" ON public.sales_analytics FOR ALL USING (true);
CREATE POLICY "Users can view product sales analytics" ON public.product_sales_analytics FOR ALL USING (true);
CREATE POLICY "Users can view category sales analytics" ON public.category_sales_analytics FOR ALL USING (true);

-- Create function to update analytics data
CREATE OR REPLACE FUNCTION public.update_analytics_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update daily sales analytics
  INSERT INTO public.sales_analytics (date, total_sales, total_items, total_transactions)
  SELECT 
    DATE(created_at) as date,
    SUM(total_amount) as total_sales,
    SUM((SELECT SUM(quantity) FROM public.sale_items WHERE sale_id = sales.id)) as total_items,
    COUNT(*) as total_transactions
  FROM public.sales
  WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ON CONFLICT (date) 
  DO UPDATE SET 
    total_sales = EXCLUDED.total_sales,
    total_items = EXCLUDED.total_items,
    total_transactions = EXCLUDED.total_transactions,
    updated_at = now();

  -- Update product sales analytics
  INSERT INTO public.product_sales_analytics (product_id, date, quantity_sold, revenue)
  SELECT 
    si.product_id,
    DATE(s.created_at) as date,
    SUM(si.quantity) as quantity_sold,
    SUM(si.total_price) as revenue
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  WHERE DATE(s.created_at) >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY si.product_id, DATE(s.created_at)
  ON CONFLICT (product_id, date)
  DO UPDATE SET 
    quantity_sold = EXCLUDED.quantity_sold,
    revenue = EXCLUDED.revenue,
    updated_at = now();

  -- Update category sales analytics
  INSERT INTO public.category_sales_analytics (category_id, date, total_sales, total_items)
  SELECT 
    p.category_id,
    DATE(s.created_at) as date,
    SUM(si.total_price) as total_sales,
    SUM(si.quantity) as total_items
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  JOIN public.products p ON si.product_id = p.id
  WHERE DATE(s.created_at) >= CURRENT_DATE - INTERVAL '30 days'
    AND p.category_id IS NOT NULL
  GROUP BY p.category_id, DATE(s.created_at)
  ON CONFLICT (category_id, date)
  DO UPDATE SET 
    total_sales = EXCLUDED.total_sales,
    total_items = EXCLUDED.total_items,
    updated_at = now();
END;
$$;

-- Create trigger to automatically update analytics when sales are made
CREATE OR REPLACE FUNCTION public.trigger_update_analytics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Call the analytics update function
  PERFORM public.update_analytics_data();
  RETURN NEW;
END;
$$;

-- Create trigger on sales table
CREATE TRIGGER update_analytics_on_sale
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_analytics();

-- Initial data population
SELECT public.update_analytics_data();
