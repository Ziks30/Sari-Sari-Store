
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Trash2 } from 'lucide-react';
import { DbProduct } from '@/types/inventory';
import { useUserRole } from '@/hooks/useUserRole';

interface InventoryTableProps {
  products: DbProduct[];
  onEditProduct: (product: DbProduct) => void;
  onRestockProduct: (product: DbProduct) => void;
  onDeleteProduct: (productId: string, productName: string) => void;
}

const InventoryTable = ({ 
  products, 
  onEditProduct, 
  onRestockProduct, 
  onDeleteProduct 
}: InventoryTableProps) => {
  const { isAdmin } = useUserRole();

  const getStockStatus = (item: DbProduct) => {
    if (item.current_stock === 0) return { label: 'Out of Stock', color: 'destructive' as const };
    if (item.current_stock <= item.minimum_stock) return { label: 'Low Stock', color: 'secondary' as const };
    return { label: 'In Stock', color: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium">Product Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Min Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Last Updated</th>
                {isAdmin && <th className="text-left p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{product.categories?.name || 'Uncategorized'}</td>
                    <td className="p-4">₱{product.unit_price}</td>
                    <td className="p-4">
                      <span className={`font-medium ${product.current_stock <= product.minimum_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="p-4">{product.minimum_stock}</td>
                    <td className="p-4">
                      <Badge variant={status.color}>{status.label}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(product.updated_at)}</td>
                    {isAdmin && (
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => onRestockProduct(product)}
                          >
                            Restock
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryTable;
