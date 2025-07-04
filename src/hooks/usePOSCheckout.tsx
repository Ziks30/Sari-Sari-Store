
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();

  const handleCashCheckout = async (cart: CartItem[], clearCart: () => void) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process transactions",
        variant: "destructive",
      });
      return;
    }

    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          cashier_id: user.id,
          total_amount: total,
          amount_paid: total,
          change_amount: 0,
          transaction_type: 'sale'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items (excluding cash borrow)
      const saleItems = cart
        .filter(item => item.id !== 'cash-borrow')
        .map(item => ({
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }));

      if (saleItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;

        // Update product stock
        for (const item of saleItems) {
          await supabase.rpc('decrement_product_stock', {
            product_id_input: item.product_id,
            quantity_input: item.quantity
          });
        }
      }

      toast({
        title: "Sale Completed",
        description: `Cash transaction of ₱${total.toFixed(2)} processed successfully`,
      });
      
      clearCart();
    } catch (error) {
      console.error('Error processing cash checkout:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to process the transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUtangCheckout = async (debtorInfo: any, cart: CartItem[], clearCart: () => void) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process transactions",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create sale record for utang
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          cashier_id: user.id,
          total_amount: debtorInfo.amount,
          amount_paid: 0,
          credit_amount: debtorInfo.amount,
          transaction_type: 'sale',
          notes: `Utang transaction for ${debtorInfo.name}`
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items if it's goods utang
      if (debtorInfo.utangType === 'goods') {
        const saleItems = cart
          .filter(item => item.id !== 'cash-borrow')
          .map(item => ({
            sale_id: sale.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }));

        if (saleItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(saleItems);

          if (itemsError) throw itemsError;

          // Update product stock
          for (const item of saleItems) {
            await supabase.rpc('decrement_product_stock', {
              product_id_input: item.product_id,
              quantity_input: item.quantity
            });
          }
        }
      }

      // Also add to local utang management
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
    } catch (error) {
      console.error('Error processing utang checkout:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to process the utang transaction. Please try again.",
        variant: "destructive",
      });
    }
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