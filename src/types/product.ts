export interface ProductVariant {
  name: string;
  price: string;
  barcode: string;
}

export interface ProductFormData {
  name: string;
  price: string;
  stock: string;
  minStock: string;
  category: string;
  barcode: string;
  description: string;
}

export interface AddProductData {
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  barcode?: string;
  description?: string;
  variants?: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  current_stock: number;
  minimum_stock: number;
  category: string;
  barcode?: string;
  description?: string;
  variants?: ProductVariant[];
  lastRestocked?: string;
}