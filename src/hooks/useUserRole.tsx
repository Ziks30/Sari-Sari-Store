
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'admin' | 'cashier' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          // Map database roles to our UserRole type
          const dbRole = data?.role;
          console.log('Database role:', dbRole); // For debugging
          
          // Map database roles to frontend roles
          if (dbRole === 'owner' || dbRole === 'manager') {
            setRole('admin');
          } else if (dbRole === 'cashier') {
            setRole('cashier');
          } else {
            setRole('cashier'); // Default fallback
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isCashier = role === 'cashier';

  return {
    role,
    isAdmin,
    isCashier,
    loading,
  };
};
