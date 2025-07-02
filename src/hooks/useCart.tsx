
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: any, variant?: string) => {
    const itemId = product.id;
    const itemName = product.name;
    const itemPrice = product.unit_price;
    
    const existingItem = cart.find(item => item.id === itemId && item.variant === variant);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === itemId && item.variant === variant
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const cartItem: CartItem = { 
        id: itemId, 
        name: itemName, 
        price: itemPrice, 
        quantity: 1, 
        variant 
      };
      setCart([...cart, cartItem]);
    }
    toast({
      title: "Item Added",
      description: `${itemName}${variant ? ` (${variant})` : ''} added to cart`,
      duration: 1000,
    });
  };

  const updateQuantity = (id: string, variant: string | undefined, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => !(item.id === id && item.variant === variant)));
    } else {
      setCart(cart.map(item =>
        item.id === id && item.variant === variant 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    }
  };

  const removeFromCart = (id: string, variant?: string) => {
    setCart(cart.filter(item => !(item.id === id && item.variant === variant)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addCashBorrowToCart = (amount: number) => {
    const cashItem: CartItem = {
      id: 'cash-borrow',
      name: 'Cash Borrowing',
      price: amount,
      quantity: 1,
    };

    const filteredCart = cart.filter(item => item.id !== 'cash-borrow');
    setCart([...filteredCart, cashItem]);
    
    toast({
      title: "Cash Borrowing Added",
      description: `₱${amount.toFixed(2)} cash borrowing added to cart`,
      duration: 1000,
    });
  };

  const hasCashBorrow = cart.some(item => item.id === 'cash-borrow');

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    addCashBorrowToCart,
    hasCashBorrow
  };
};
