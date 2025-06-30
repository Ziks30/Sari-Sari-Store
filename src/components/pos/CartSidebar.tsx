
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, Banknote, CreditCard } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, variant: string | undefined, newQuantity: number) => void;
  onRemoveFromCart: (id: string, variant?: string) => void;
  onCheckout: (paymentType: 'cash' | 'utang') => void;
  hasCashBorrow: boolean;
}

const CartSidebar = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onCheckout, 
  hasCashBorrow 
}: CartSidebarProps) => {
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="w-1/3 flex-shrink-0">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Current Sale</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-3 pr-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.variant || 'default'}-${index}`} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500 truncate">{item.variant}</p>}
                      <p className="text-xs text-gray-600">₱{item.price} each</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.id !== 'cash-borrow' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.variant, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <span className="w-12 text-center text-sm font-medium text-orange-600">
                          Cash
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveFromCart(item.id, item.variant)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="flex-shrink-0">
            <Separator className="mb-4" />
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Items:</span>
                <Badge variant="secondary">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-teal-600">₱{getTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={() => onCheckout('cash')}
                className="bg-green-600 hover:bg-green-700"
                disabled={hasCashBorrow}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash Payment
              </Button>
              <Button 
                onClick={() => onCheckout('utang')}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Utang Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CartSidebar;
