
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/utils/seedDatabase';
import { Database, Loader2 } from 'lucide-react';

const SeedDatabaseButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    
    try {
      const result = await seedDatabase();
      
      if (result.success) {
        toast({
          title: "Database Seeded Successfully",
          description: "Sample transaction data has been added to the database.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed database",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedDatabase} 
      disabled={isSeeding}
      variant="outline"
      className="flex items-center space-x-2"
    >
      {isSeeding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      <span>{isSeeding ? 'Seeding...' : 'Seed Database'}</span>
    </Button>
  );
};

export default SeedDatabaseButton;
