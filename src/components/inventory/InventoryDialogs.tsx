
import AddProductDialog from '@/components/AddProductDialog';
import EditProductDialog from '@/components/EditProductDialog';
import RestockDialog from '@/components/RestockDialog';
import SettingsDialog from '@/components/settings/SettingsDialog';
import { EditProduct } from '@/types/inventory';

interface InventoryDialogsProps {
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  restockDialogOpen: boolean;
  setRestockDialogOpen: (open: boolean) => void;
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: (open: boolean) => void;
  selectedProduct: EditProduct | null;
  onAddProduct: (productData: any) => void;
  onEditProduct: (productId: string, updates: any) => void;
  onRestock: (quantity: number) => void;
}

const InventoryDialogs = ({
  addDialogOpen,
  setAddDialogOpen,
  editDialogOpen,
  setEditDialogOpen,
  restockDialogOpen,
  setRestockDialogOpen,
  settingsDialogOpen,
  setSettingsDialogOpen,
  selectedProduct,
  onAddProduct,
  onEditProduct,
  onRestock,
}: InventoryDialogsProps) => {
  return (
    <>
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddProduct={onAddProduct}
      />
      
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        onEditProduct={onEditProduct}
      />
      
      <RestockDialog
        open={restockDialogOpen}
        onOpenChange={setRestockDialogOpen}
        productName={selectedProduct?.name || ''}
        currentStock={selectedProduct?.stock || 0}
        onRestock={onRestock}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </>
  );
};

export default InventoryDialogs;
