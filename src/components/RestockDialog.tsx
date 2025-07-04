import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentStock: number;
  onRestock: (newStock: number) => void;
}

const RestockDialog = ({
  open,
  onOpenChange,
  productName,
  currentStock,
  onRestock,
}: RestockDialogProps) => {
  const [newStock, setNewStock] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setNewStock(currentStock.toString());
  }, [currentStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newStock);
    if (isNaN(parsed) || parsed < 0) {
      toast({
        title: 'Invalid Stock Value',
        description: 'Please enter a valid non-negative number.',
        variant: 'destructive',
      });
      return;
    }

    onRestock(parsed); // Use the new stock directly
    onOpenChange(false);
    toast({
      title: 'Stock Updated',
      description: `${productName} stock updated to ${parsed}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Modify the stock level for <strong>{productName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stock">New Stock Level</Label>
            <Input
              id="stock"
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              min="0"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockDialog;
