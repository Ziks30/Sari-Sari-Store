
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, DollarSign } from 'lucide-react';

interface ProductSearchControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  barcode: string;
  setBarcode: (barcode: string) => void;
  onBarcodeSearch: () => void;
  cashBorrowAmount: string;
  setCashBorrowAmount: (amount: string) => void;
  onAddCashBorrow: () => void;
}

const ProductSearchControls = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  barcode,
  setBarcode,
  onBarcodeSearch,
  cashBorrowAmount,
  setCashBorrowAmount,
  onAddCashBorrow
}: ProductSearchControlsProps) => {
  return (
    <Card className="mb-6 flex-shrink-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Product Search & Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Search Products</label>
            <Input
              placeholder="Search by name or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category Filter</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Barcode Scanner</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Scan or enter barcode..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Button onClick={onBarcodeSearch} size="sm">
                Add
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Cash Borrowing</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Enter cash amount..."
                value={cashBorrowAmount}
                onChange={(e) => setCashBorrowAmount(e.target.value)}
              />
              <Button 
                onClick={onAddCashBorrow}
                className="bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Add Cash
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSearchControls;
