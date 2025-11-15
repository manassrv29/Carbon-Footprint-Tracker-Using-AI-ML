import React from 'react';
import { AuthGuard } from '../components/auth/AuthGuard';
import { CorporateDashboard } from '../components/corporate/CorporateDashboard';

export const CorporateHomePage: React.FC = () => {
  return (
    <AuthGuard requiredRole="corporate">
      <CorporateDashboard />
    </AuthGuard>
  );
};
