
import { ProductVariant } from '@/types/product';

export const createSizeVariants = (basePrice: number, existingVariants: ProductVariant[]): ProductVariant[] => {
  const variantNames = ['Small', 'Medium', 'Large'];
  
  return variantNames.map((name, index) => ({
    name,
    price: (basePrice + (index * 5)).toFixed(2),
    barcode: ''
  }));
};

export const createFlavorVariants = (basePrice: number): ProductVariant[] => {
  const flavorNames = ['Original', 'Spicy', 'Sweet & Sour', 'Hot & Spicy'];
  
  return flavorNames.map((name) => ({
    name,
    price: basePrice.toFixed(2),
    barcode: ''
  }));
};

export const createCustomVariants = (basePrice: number, existingVariantsCount: number): ProductVariant[] => {
  const variantCount = 3;
  
  return Array.from({ length: variantCount }, (_, index) => ({
    name: `Variant ${existingVariantsCount + index + 1}`,
    price: basePrice.toFixed(2),
    barcode: ''
  }));
};
