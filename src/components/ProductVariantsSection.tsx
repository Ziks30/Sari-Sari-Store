
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { ProductVariant } from '@/types/product';
import { createSizeVariants, createFlavorVariants, createCustomVariants } from '@/utils/variantUtils';

interface ProductVariantsSectionProps {
  hasVariants: boolean;
  setHasVariants: (value: boolean) => void;
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
  basePrice: number;
}

const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  hasVariants,
  setHasVariants,
  variants,
  setVariants,
  basePrice
}) => {
  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    const updatedVariants = [...variants];
    if (field === 'price') {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    } else {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    }
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: basePrice.toFixed(2), barcode: '' }]);
  };

  const generateVariants = (type: string) => {
    let newVariants: ProductVariant[] = [];
    
    switch (type) {
      case 'size':
        newVariants = createSizeVariants(basePrice, variants);
        break;
      case 'flavor':
        newVariants = createFlavorVariants(basePrice);
        break;
      case 'custom':
        newVariants = createCustomVariants(basePrice, variants.length);
        break;
    }
    
    setVariants([...variants, ...newVariants]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasVariants"
          checked={hasVariants}
          onChange={(e) => {
            setHasVariants(e.target.checked);
            if (!e.target.checked) {
              setVariants([]);
            }
          }}
          className="rounded"
        />
        <Label htmlFor="hasVariants">This product has variants</Label>
      </div>

      {hasVariants && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <div className="flex space-x-2">
              <Select onValueChange={generateVariants}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Quick Add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size">Size Variants</SelectItem>
                  <SelectItem value="flavor">Flavor Variants</SelectItem>
                  <SelectItem value="custom">Custom Variants</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addVariant} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No variants added yet. Click "Add Variant" or use "Quick Add" to create variants.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="e.g., Small, Original"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-price-${index}`}>Price</Label>
                    <Input
                      id={`variant-price-${index}`}
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-barcode-${index}`}>Barcode</Label>
                    <Input
                      id={`variant-barcode-${index}`}
                      value={variant.barcode}
                      onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                      placeholder="Optional barcode"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-2">
                <Badge variant="secondary">
                  {variants.length} variant{variants.length !== 1 ? 's' : ''} added
                </Badge>
                <p className="text-sm text-gray-600">
                  Price range: ₱{Math.min(...variants.map(v => parseFloat(v.price) || 0)).toFixed(2)} - 
                  ₱{Math.max(...variants.map(v => parseFloat(v.price) || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariantsSection;
