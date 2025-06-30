
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  barcode: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category: string;
  variants?: ProductVariant[];
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Products</h2>
      <ScrollArea className="h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onProductClick(product)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-teal-600">₱{product.price}</p>
                {product.variants && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {product.variants.length} variants
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductGrid;
