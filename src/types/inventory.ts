
export interface DbProduct {
  id: string;
  name: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  updated_at: string;
  categories?: {
    name: string;
  };
}

export interface EditProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  lastRestocked: string;
  barcode: string;
  description: string;
}

export interface ProductInput {
  name: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  category_id: string;
  description?: string;
}
