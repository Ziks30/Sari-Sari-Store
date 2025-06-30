
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InventoryStats from './inventory/InventoryStats';
import InventoryTable from './inventory/InventoryTable';
import LowStockAlert from './inventory/LowStockAlert';
import AddProductDialog from './AddProductDialog';
import EditProductDialog from './EditProductDialog';
import RestockDialog from './RestockDialog';
import SettingsDialog from './settings/SettingsDialog';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const InventoryManagement = () => {
  const { products, isLoading, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  
  const categoryOptions = ['All', ...categories.map(cat => cat.name)];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (product.categories && product.categories.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = products.filter(item => item.current_stock <= item.minimum_stock);
  const outOfStockItems = products.filter(item => item.current_stock === 0);

  const handleEditProduct = (productId: string, updates: any) => {
    updateProduct({ id: productId, updates });
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleRestock = (quantity: number) => {
    if (selectedProduct) {
      updateProduct({
        id: selectedProduct.id,
        updates: {
          current_stock: selectedProduct.current_stock + quantity
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

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const openRestockDialog = (product: any) => {
    setSelectedProduct(product);
    setRestockDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsDialogOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <InventoryStats 
        inventory={products}
        lowStockItems={lowStockItems}
        outOfStockItems={outOfStockItems}
      />

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {categoryOptions.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <InventoryTable
        products={filteredProducts}
        onEditProduct={openEditDialog}
        onRestockProduct={openRestockDialog}
        onDeleteProduct={handleDeleteProduct}
      />

      <LowStockAlert lowStockItems={lowStockItems} />

      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        onEditProduct={handleEditProduct}
      />
      
      <RestockDialog
        open={restockDialogOpen}
        onOpenChange={setRestockDialogOpen}
        productName={selectedProduct?.name || ''}
        currentStock={selectedProduct?.current_stock || 0}
        onRestock={handleRestock}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
};

export default InventoryManagement;
