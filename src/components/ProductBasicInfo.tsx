
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductFormData } from '@/types/product';
import { useCategories } from '@/hooks/useCategories';

interface ProductBasicInfoProps {
  formData: ProductFormData;
  onInputChange: (field: string, value: string) => void;
}

const ProductBasicInfo = ({ formData, onInputChange }: ProductBasicInfoProps) => {
  const { categories } = useCategories();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => onInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Base Price (₱) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="barcode">Base Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => onInputChange('barcode', e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Initial Stock *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => onInputChange('stock', e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Minimum Stock *</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => onInputChange('minStock', e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Optional product description"
          rows={3}
        />
      </div>
    </>
  );
};

export default ProductBasicInfo;
