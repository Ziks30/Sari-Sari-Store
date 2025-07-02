
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface POSHeaderProps {
  onSettingsClick: () => void;
}

const POSHeader = ({ onSettingsClick }: POSHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Point of Sale</h1>
      <Button
        variant="outline"
        size="sm"
        onClick={onSettingsClick}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  );
};

export default POSHeader;
