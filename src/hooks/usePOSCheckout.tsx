import { useToast } from "@/hooks/use-toast";
import { addUtangTransaction, UtangTransaction } from "@/components/UtangManagement";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
        description: "You must be logged in to process transactions",
        variant: "destructive",
      });
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      // Step 1: Insert transaction to `sales` table
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            customer_id: null,
            cashier_id: user.id,
            total_amount: total,
            amount_paid: total,
            change_amount: 0,
            credit_amount: 0,
            transaction_type: "sale",
            notes: `Processed ${cart.length} items`,
          }
        ]).select().single();

      if (saleError) throw saleError;

      // Step 2: Insert sale_items
      const saleItemsPayload = cart.map(item => ({
        sale_id: saleData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .insert(saleItemsPayload);

      if (saleItemsError) throw saleItemsError;

      // Step 3: Update stock + insert into stock_movements
      for (const item of cart) {
        const { error: stockUpdateError } = await supabase.rpc("decrement_product_stock", {
          product_id_input: item.id,
          quantity_input: item.quantity,
        } as {
          product_id_input: string;
          quantity_input: number;
        });

        if (stockUpdateError) {
          throw new Error(`Failed to update stock for ${item.name}: ${stockUpdateError.message}`);
        }

        // Optional: Log stock movement
        await supabase.from("stock_movements").insert([{
          product_id: item.id,
          movement_type: "sale",
          quantity: item.quantity,
          reference_id: saleData.id,
          reference_type: "sale",
          notes: `Sold ${item.quantity} unit(s) of ${item.name}`,
          created_by: user.id,
        }]);
      }

      toast({
        title: "Sale Completed",
        description: `Cash transaction of ₱${total.toFixed(2)} processed`,
      });

      clearCart();

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred during checkout.",
        variant: "destructive",
      });
    }
  };

  const handleUtangCheckout = (debtorInfo: any, cart: CartItem[], clearCart: () => void) => {
    const utangTransaction: UtangTransaction = {
      id: `utang-${Date.now()}`,
      customerName: debtorInfo.name,
      customerPhone: debtorInfo.phone,
      customerAddress: debtorInfo.address,
      amount: debtorInfo.amount,
      type: debtorInfo.utangType,
      date: new Date().toISOString().split("T")[0],
      status: "active",
      notes: debtorInfo.notes,
      items: debtorInfo.utangType === "goods"
        ? cart.filter(item => item.id !== "cash-borrow").map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        : undefined,
    };

    addUtangTransaction(utangTransaction);

    toast({
      title: "Utang Recorded",
      description: `${debtorInfo.utangType === "cash" ? "Cash loan" : "Goods purchase"} of ₱${debtorInfo.amount.toFixed(2)} recorded for ${debtorInfo.name}`,
    });

    clearCart();
  };

  const validateCheckout = (cart: CartItem[], paymentType: "cash" | "utang", hasCashBorrow: boolean) => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart first",
        variant: "destructive",
      });
      return false;
    }

    if (hasCashBorrow && paymentType === "cash") {
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
    validateCheckout,
  };
};
