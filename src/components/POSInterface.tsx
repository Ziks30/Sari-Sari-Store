
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { usePOSSearch } from '@/hooks/usePOSSearch';
import { usePOSCheckout } from '@/hooks/usePOSCheckout';
import ProductSearchControls from './pos/ProductSearchControls';
import ProductGrid from './pos/ProductGrid';
import CartSidebar from './pos/CartSidebar';
import POSHeader from './pos/POSHeader';
import POSDialogs from './pos/POSDialogs';

const POSInterface = () => {
  const { products, isLoading } = useProducts();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotal, 
    addCashBorrowToCart, 
    hasCashBorrow 
  } = useCart();
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory, 
    filterProducts 
  } = usePOSSearch();
  const { handleCashCheckout, handleUtangCheckout, validateCheckout } = usePOSCheckout();
  
  const [utangDialogOpen, setUtangDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [cashBorrowAmount, setCashBorrowAmount] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean)))];
  const filteredProducts = filterProducts(products);

  const handleAddCashBorrow = () => {
    const amount = parseFloat(cashBorrowAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    addCashBorrowToCart(amount);
    setCashBorrowAmount('');
  };

  const handleCheckout = (paymentType: 'cash' | 'utang') => {
    if (!validateCheckout(cart, paymentType, hasCashBorrow)) {
      return;
    }

    if (paymentType === 'utang') {
      setUtangDialogOpen(true);
    } else {
      handleCashCheckout(cart, clearCart);
    }
  };

  const handleUtangConfirm = (debtorInfo: any) => {
    handleUtangCheckout(debtorInfo, cart, clearCart);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading POS...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-6 p-6">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <POSHeader onSettingsClick={() => setSettingsDialogOpen(true)} />

        <ProductSearchControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          cashBorrowAmount={cashBorrowAmount}
          setCashBorrowAmount={setCashBorrowAmount}
          onAddCashBorrow={handleAddCashBorrow}
        />

        <ProductGrid
          products={filteredProducts}
          onProductClick={addToCart}
        />
      </div>

      <CartSidebar
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onCheckout={handleCheckout}
        hasCashBorrow={hasCashBorrow}
      />

      <POSDialogs
        utangDialogOpen={utangDialogOpen}
        setUtangDialogOpen={setUtangDialogOpen}
        settingsDialogOpen={settingsDialogOpen}
        setSettingsDialogOpen={setSettingsDialogOpen}
        totalAmount={getTotal()}
        onUtangConfirm={handleUtangConfirm}
      />
    </div>
  );
};

export default POSInterface;
