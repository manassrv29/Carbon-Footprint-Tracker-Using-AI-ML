import React from 'react';
import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'corporate';
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, token } = useAuth();

  // Not authenticated
  if (!user || !token) {
    return fallback || <div>Please log in to access this content.</div>;
  }

  // Role-based access control
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-muted-900 mb-2">Access Denied</h2>
          <p className="text-muted-600">
            You don't have permission to access this page. 
            Required role: {requiredRole}, your role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
