
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  current_stock: number;
  categories?: {
    name: string;
  };
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {products.map((product) => (
          <Card 
            key={product.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onProductClick(product)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-teal-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-teal-600">₱{product.unit_price}</p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.current_stock}
                  </p>
                  <p className="text-xs text-gray-400">
                    {product.categories?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
