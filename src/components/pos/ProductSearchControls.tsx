
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
  cashBorrowAmount,
  setCashBorrowAmount,
  onAddCashBorrow
}: ProductSearchControlsProps) => {
  return (
    <Card className="mb-4 flex-shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Search className="w-5 h-5" />
          <span>Product Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9">
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

        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              placeholder="Cash borrowing amount..."
              value={cashBorrowAmount}
              onChange={(e) => setCashBorrowAmount(e.target.value)}
              className="h-9"
            />
          </div>
          <Button 
            onClick={onAddCashBorrow}
            className="bg-orange-600 hover:bg-orange-700 h-9 px-4"
            size="sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Add Cash
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSearchControls;
