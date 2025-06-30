
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData, ProductVariant, AddProductData } from '@/types/product';
import ProductBasicInfo from './ProductBasicInfo';
import ProductVariantsSection from './ProductVariantsSection';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: AddProductData) => void;
}

const AddProductDialog = ({ open, onOpenChange, onAddProduct }: AddProductDialogProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    stock: '',
    minStock: '',
    category: '',
    barcode: '',
    description: ''
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.minStock || !formData.category) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate variants if they exist
    if (hasVariants && variants.length > 0) {
      const invalidVariants = variants.some(v => !v.name || !v.price);
      if (invalidVariants) {
        toast({
          title: "Invalid Variants",
          description: "Please fill in name and price for all variants",
          variant: "destructive",
        });
        return;
      }
    }

    onAddProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      category: formData.category,
      barcode: formData.barcode,
      description: formData.description,
      variants: hasVariants && variants.length > 0 ? variants : undefined
    });

    // Reset form
    setFormData({
      name: '',
      price: '',
      stock: '',
      minStock: '',
      category: '',
      barcode: '',
      description: ''
    });
    setVariants([]);
    setHasVariants(false);

    onOpenChange(false);
    
    toast({
      title: "Product Added",
      description: `${formData.name} has been added to inventory`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Convert formData.price to number for basePrice, defaulting to 0 if empty or invalid
  const basePrice = parseFloat(formData.price) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductBasicInfo 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <ProductVariantsSection
            hasVariants={hasVariants}
            setHasVariants={setHasVariants}
            variants={variants}
            setVariants={setVariants}
            basePrice={basePrice}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
