
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { DbProduct, EditProduct } from '@/types/inventory';

export const useInventoryManagement = () => {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EditProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  const handleAddProduct = (productData: any) => {
    const category = categories.find(cat => cat.name === productData.category);
    
    const productInput = {
      name: productData.name,
      unit_price: productData.price,
      cost_price: productData.price * 0.8,
      current_stock: productData.stock,
      minimum_stock: productData.minStock,
      maximum_stock: productData.stock * 2,
      category_id: category?.id || null,
      description: productData.description,
    };

    addProduct(productInput);
  };

  const handleEditProduct = (productId: string, updates: any) => {
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.price) dbUpdates.unit_price = updates.price;
    if (updates.minStock) dbUpdates.minimum_stock = updates.minStock;
    if (updates.description) dbUpdates.description = updates.description;
    
    if (updates.category) {
      const category = categories.find(cat => cat.name === updates.category);
      dbUpdates.category_id = category?.id || null;
    }

    updateProduct({ id: productId, updates: dbUpdates });
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleRestock = (quantity: number) => {
    if (selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        updates: {
          current_stock: selectedProduct.stock + quantity
        }
      });
      setRestockDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProduct(productId);
    }
  };

  const transformDbProductToEditProduct = (product: DbProduct): EditProduct => {
    return {
      id: product.id,
      name: product.name,
      price: product.unit_price,
      stock: product.current_stock,
      minStock: product.minimum_stock,
      category: product.categories?.name || '',
      lastRestocked: product.updated_at,
      barcode: '',
      description: ''
    };
  };

  const openEditDialog = (product: DbProduct) => {
    const transformedProduct = transformDbProductToEditProduct(product);
    setSelectedProduct(transformedProduct);
    setEditDialogOpen(true);
  };

  const openRestockDialog = (product: DbProduct) => {
    const transformedProduct = transformDbProductToEditProduct(product);
    setSelectedProduct(transformedProduct);
    setRestockDialogOpen(true);
  };

  return {
    products,
    categories,
    isLoading,
    loading: isLoading, // alias for compatibility
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    restockDialogOpen,
    setRestockDialogOpen,
    settingsDialogOpen,
    setSettingsDialogOpen,
    selectedProduct,
    setSelectedProduct,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleAddProduct,
    addProduct: handleAddProduct,
    handleEditProduct,
    editProduct: handleEditProduct,
    handleRestock,
    restockProduct: (productId: string, quantity: number) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        updateProduct({
          id: productId,
          updates: {
            current_stock: product.current_stock + quantity
          }
        });
      }
    },
    handleDeleteProduct,
    openEditDialog,
    openRestockDialog,
  };
};
