import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../components/auth/AuthProvider';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, error } = useAuth();

  const handleLogin = async (credentials: any) => {
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by AuthProvider
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await register(data);
    } catch (err) {
      // Error is handled by AuthProvider
    }
  };

  return (
    <>
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
          isLoading={isLoading}
          error={error || undefined}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
          isLoading={isLoading}
          error={error || undefined}
        />
      )}
    </>
  );
};
