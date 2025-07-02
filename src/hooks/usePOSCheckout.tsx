
import { useToast } from '@/hooks/use-toast';
import { addUtangTransaction, UtangTransaction } from '@/components/UtangManagement';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export const usePOSCheckout = () => {
  const { toast } = useToast();

  const handleCashCheckout = (cart: CartItem[], clearCart: () => void) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    toast({
      title: "Sale Completed",
      description: `Cash transaction of ₱${total.toFixed(2)} processed`,
    });
    clearCart();
  };

  const handleUtangCheckout = (debtorInfo: any, cart: CartItem[], clearCart: () => void) => {
    const utangTransaction: UtangTransaction = {
      id: `utang-${Date.now()}`,
      customerName: debtorInfo.name,
      customerPhone: debtorInfo.phone,
      customerAddress: debtorInfo.address,
      amount: debtorInfo.amount,
      type: debtorInfo.utangType,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: debtorInfo.notes,
      items: debtorInfo.utangType === 'goods' ? cart.filter(item => item.id !== 'cash-borrow').map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })) : undefined
    };

    addUtangTransaction(utangTransaction);

    toast({
      title: "Utang Recorded",
      description: `${debtorInfo.utangType === 'cash' ? 'Cash loan' : 'Goods purchase'} of ₱${debtorInfo.amount.toFixed(2)} recorded for ${debtorInfo.name}`,
    });
    clearCart();
  };

  const validateCheckout = (cart: CartItem[], paymentType: 'cash' | 'utang', hasCashBorrow: boolean) => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart first",
        variant: "destructive",
      });
      return false;
    }

    if (hasCashBorrow && paymentType === 'cash') {
      toast({
        title: "Invalid Payment Method",
        description: "Cannot use cash payment when there's cash borrowing in cart",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    handleCashCheckout,
    handleUtangCheckout,
    validateCheckout
  };
};
