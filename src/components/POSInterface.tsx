import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProductSearchControls from './pos/ProductSearchControls';
import ProductGrid from './pos/ProductGrid';
import CartSidebar from './pos/CartSidebar';
import VariantOverlay from './pos/VariantOverlay';
import UtangDialog from './UtangDialog';
import SettingsDialog from './settings/SettingsDialog';
import { addUtangTransaction, UtangTransaction } from './UtangManagement';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

const POSInterface = () => {
  const { products, isLoading } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcode, setBarcode] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<any>(null);
  const [utangDialogOpen, setUtangDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [cashBorrowAmount, setCashBorrowAmount] = useState('');
  const { toast } = useToast();

  const categories = ['All', ...Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (product.categories && product.categories.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
    setExpandedProduct(null);
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

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addCashBorrowToCart = () => {
    const amount = parseFloat(cashBorrowAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid cash amount",
        variant: "destructive",
      });
      return;
    }

    const cashItem: CartItem = {
      id: 'cash-borrow',
      name: 'Cash Borrowing',
      price: amount,
      quantity: 1,
    };

    const filteredCart = cart.filter(item => item.id !== 'cash-borrow');
    setCart([...filteredCart, cashItem]);
    setCashBorrowAmount('');
    
    toast({
      title: "Cash Borrowing Added",
      description: `₱${amount.toFixed(2)} cash borrowing added to cart`,
      duration: 1000,
    });
  };

  const hasCashBorrow = cart.some(item => item.id === 'cash-borrow');

  const handleCheckout = (paymentType: 'cash' | 'utang') => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart first",
        variant: "destructive",
      });
      return;
    }

    if (hasCashBorrow && paymentType === 'cash') {
      toast({
        title: "Invalid Payment Method",
        description: "Cannot use cash payment when there's cash borrowing in cart",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'utang') {
      setUtangDialogOpen(true);
    } else {
      toast({
        title: "Sale Completed",
        description: `Cash transaction of ₱${getTotal().toFixed(2)} processed`,
      });
      setCart([]);
    }
  };

  const handleUtangConfirm = (debtorInfo: any) => {
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
    setCart([]);
  };

  const handleBarcodeSearch = () => {
    // Barcode search functionality can be implemented later
  };

  const handleProductClick = (product: any) => {
    addToCart(product);
  };

  const handleSelectVariant = (variant: any) => {
    addToCart(variant, variant.name);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && barcode) {
        handleBarcodeSearch();
      }
      if (e.key === 'Escape') {
        setExpandedProduct(null);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [barcode]);

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsDialogOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <ProductSearchControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          barcode={barcode}
          setBarcode={setBarcode}
          onBarcodeSearch={() => {}}
          cashBorrowAmount={cashBorrowAmount}
          setCashBorrowAmount={setCashBorrowAmount}
          onAddCashBorrow={() => {}}
        />

        <ProductGrid
          products={filteredProducts}
          onProductClick={handleProductClick}
        />
      </div>

      <CartSidebar
        cart={cart}
        onUpdateQuantity={(id, variant, newQuantity) => {
          if (newQuantity <= 0) {
            setCart(cart.filter(item => item.id !== id));
          } else {
            setCart(cart.map(item =>
              item.id === id ? { ...item, quantity: newQuantity } : item
            ));
          }
        }}
        onRemoveFromCart={(id) => {
          setCart(cart.filter(item => item.id !== id));
        }}
        onCheckout={(paymentType) => {
          if (cart.length === 0) {
            toast({
              title: "Empty Cart",
              description: "Please add items to cart first",
              variant: "destructive",
            });
            return;
          }

          if (paymentType === 'utang') {
            setUtangDialogOpen(true);
          } else {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            toast({
              title: "Sale Completed",
              description: `Cash transaction of ₱${total.toFixed(2)} processed`,
            });
            setCart([]);
          }
        }}
        hasCashBorrow={false}
      />

      <UtangDialog
        open={utangDialogOpen}
        onOpenChange={setUtangDialogOpen}
        totalAmount={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        onUtangConfirm={(debtorInfo) => {
          setCart([]);
          toast({
            title: "Utang Recorded",
            description: `Transaction recorded for ${debtorInfo.name}`,
          });
        }}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
};

export default POSInterface;
