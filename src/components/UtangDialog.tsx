import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface UtangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onUtangConfirm: (debtorInfo: {
    name: string;
    phone: string;
    address: string;
    utangType: 'cash' | 'goods';
    amount: number;
    creditLimit: number; // new field
  }) => void;
}

const UtangDialog = ({ open, onOpenChange, totalAmount, onUtangConfirm }: UtangDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    utangType: 'goods' as 'cash' | 'goods',
    creditLimit: 1000, // default value, can be changed
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the debtor's name and phone number",
        variant: "destructive",
      });
      return;
    }
    if (!formData.creditLimit || formData.creditLimit < totalAmount) {
      toast({
        title: "Invalid Credit Limit",
        description: "Credit limit must be set and greater than or equal to the utang amount.",
        variant: "destructive",
      });
      return;
    }

    onUtangConfirm({
      ...formData,
      amount: totalAmount,
      creditLimit: formData.creditLimit,
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      address: '',
      utangType: 'goods',
      creditLimit: 1000,
    });

    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Record Utang</DialogTitle>
          <DialogDescription>
            Enter the debtor's information for this ₱{totalAmount.toFixed(2)} transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="utang-type">Utang Type *</Label>
            <Select 
              value={formData.utangType} 
              onValueChange={(value: 'cash' | 'goods') => handleInputChange('utangType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select utang type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goods">Goods (Products)</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="debtor-name">Debtor Name *</Label>
            <Input
              id="debtor-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter debtor's full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="debtor-phone">Phone Number *</Label>
            <Input
              id="debtor-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="09XX-XXX-XXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="debtor-address">Address</Label>
            <Input
              id="debtor-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Optional address"
            />
          </div>

          <div>
            <Label htmlFor="credit-limit">Credit Limit *</Label>
            <Input
              id="credit-limit"
              type="number"
              inputMode="numeric"
              min={totalAmount}
              value={formData.creditLimit}
              onChange={(e) => handleInputChange('creditLimit', Number(e.target.value))}
              placeholder="e.g. 1000"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set the maximum utang this customer can accumulate.
            </p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Transaction Details:</strong>
            </p>
            <p className="text-sm text-orange-600">
              Type: {formData.utangType === 'cash' ? 'Cash Loan' : 'Goods Purchase'}
            </p>
            <p className="text-sm text-orange-600">
              Amount: ₱{totalAmount.toFixed(2)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Record Utang
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UtangDialog;