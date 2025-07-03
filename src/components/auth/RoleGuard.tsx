
import { useUserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'cashier')[];
  fallback?: React.ReactNode;
}

const RoleGuard = ({ children, allowedRoles, fallback = null }: RoleGuardProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
