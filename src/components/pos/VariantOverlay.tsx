
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  barcode: string;
}

interface Product {
  id: string;
  name: string;
  variants?: ProductVariant[];
}

interface VariantOverlayProps {
  product: Product | null;
  onClose: () => void;
  onSelectVariant: (variant: ProductVariant) => void;
}

const VariantOverlay = ({ product, onClose, onSelectVariant }: VariantOverlayProps) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {product.name} - Variants
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {product.variants?.map((variant) => (
              <Card 
                key={variant.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectVariant(variant)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{variant.name}</h4>
                      <p className="text-xs text-gray-500">{variant.barcode}</p>
                    </div>
                    <p className="font-bold text-teal-600">₱{variant.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantOverlay;
