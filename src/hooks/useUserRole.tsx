import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRole = () => {
  const [role, setRole] = useState<'admin' | 'cashier' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user role",
            variant: "destructive",
          });
          return;
        }

        // Map database roles to frontend roles
        const mappedRole = profile?.role === 'admin' ? 'admin' : 'cashier';
        setRole(mappedRole);
        
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user role",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [toast]);

  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    loading
  };
};