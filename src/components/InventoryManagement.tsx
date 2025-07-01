
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { DbProduct } from '@/types/inventory';
import InventoryStats from './inventory/InventoryStats';
import InventoryFilters from './inventory/InventoryFilters';
import InventoryTable from './inventory/InventoryTable';
import LowStockAlert from './inventory/LowStockAlert';
import InventoryDialogs from './inventory/InventoryDialogs';

const InventoryManagement = () => {
  const {
    products,
    categories,
    loading,
    selectedProduct,
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    restockDialogOpen,
    setRestockDialogOpen,
    settingsDialogOpen,
    setSettingsDialogOpen,
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
    addProduct,
    editProduct,
    restockProduct,
    handleDeleteProduct,
    openEditDialog,
    openRestockDialog,
  } = useInventoryManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  // Transform products to match DbProduct interface
  const dbProducts: DbProduct[] = products.map(product => ({
    id: product.id,
    name: product.name,
    unit_price: product.unit_price,
    current_stock: product.current_stock,
    minimum_stock: product.minimum_stock,
    updated_at: product.updated_at || new Date().toISOString(),
    categories: product.categories
  }));

  // Filter products based on search, category, and stock filters
  const filteredProducts = dbProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (product.categories && product.categories.name === selectedCategory);
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.current_stock <= product.minimum_stock;
    } else if (stockFilter === 'out') {
      matchesStock = product.current_stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'stock':
        aValue = a.current_stock;
        bValue = b.current_stock;
        break;
      case 'price':
        aValue = a.unit_price;
        bValue = b.unit_price;
        break;
      case 'updated':
        aValue = a.updated_at;
        bValue = b.updated_at;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const lowStockItems = dbProducts.filter(
    product => product.current_stock <= product.minimum_stock
  );

  const handleAddProduct = async (productData: any) => {
    await addProduct(productData);
    setAddDialogOpen(false);
  };

  const handleEditProduct = async (productId: string, updates: any) => {
    await editProduct(productId, updates);
    setEditDialogOpen(false);
  };

  const handleRestock = async (quantity: number) => {
    if (selectedProduct) {
      await restockProduct(selectedProduct.id, quantity);
      setRestockDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <InventoryStats products={sortedProducts} />
      
      <LowStockAlert lowStockItems={lowStockItems} />

      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
        onAddProduct={() => setAddDialogOpen(true)}
        onOpenSettings={() => setSettingsDialogOpen(true)}
      />

      <InventoryTable
        products={sortedProducts}
        onEditProduct={openEditDialog}
        onRestockProduct={openRestockDialog}
        onDeleteProduct={handleDeleteProduct}
      />

      <InventoryDialogs
        addDialogOpen={addDialogOpen}
        setAddDialogOpen={setAddDialogOpen}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        restockDialogOpen={restockDialogOpen}
        setRestockDialogOpen={setRestockDialogOpen}
        settingsDialogOpen={settingsDialogOpen}
        setSettingsDialogOpen={setSettingsDialogOpen}
        selectedProduct={selectedProduct}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onRestock={handleRestock}
      />
    </div>
  );
};

export default InventoryManagement;
