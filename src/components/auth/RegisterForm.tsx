import React, { useState } from 'react';
import { User, Building2, Mail, Lock, Eye, EyeOff, UserPlus, Building } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface RegisterFormProps {
  onRegister: (data: RegisterData) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'corporate';
  // Corporate-specific fields
  organizationId?: number;
  organizationName?: string;
  organizationDomain?: string;
  organizationIndustry?: string;
  organizationSize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onSwitchToLogin,
  isLoading = false,
  error
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    onRegister(formData);
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.password && formData.firstName && formData.lastName && passwordsMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-muted-900 mb-2">Join CarbonTracker</h1>
          <p className="text-muted-600">Start your sustainability journey today</p>
        </div>

        {/* Role Toggle */}
        <div className="mb-6">
          <div className="flex bg-muted-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleInputChange('role', 'user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.role === 'user'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-muted-600 hover:text-muted-900'
              }`}
            >
              <User size={16} />
              Individual
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('role', 'corporate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.role === 'corporate'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-muted-600 hover:text-muted-900'
              }`}
            >
              <Building2 size={16} />
              Corporate
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-muted-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-400" size={18} />
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="First name"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-muted-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-400" size={18} />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Fields */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-400" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-400 hover:text-muted-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-400" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formData.confirmPassword && !passwordsMatch 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-muted-300'
                }`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-400 hover:text-muted-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Corporate-specific fields */}
          {formData.role === 'corporate' && (
            <div className="space-y-4 p-4 bg-muted-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building className="text-primary-600" size={18} />
                <h3 className="font-medium text-muted-900">Organization Details</h3>
              </div>
              
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-muted-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  value={formData.organizationName || ''}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="w-full px-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organizationDomain" className="block text-sm font-medium text-muted-700 mb-2">
                    Domain
                  </label>
                  <input
                    id="organizationDomain"
                    type="text"
                    value={formData.organizationDomain || ''}
                    onChange={(e) => handleInputChange('organizationDomain', e.target.value)}
                    className="w-full px-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="company.com"
                  />
                </div>
                <div>
                  <label htmlFor="organizationSize" className="block text-sm font-medium text-muted-700 mb-2">
                    Company Size
                  </label>
                  <select
                    id="organizationSize"
                    value={formData.organizationSize || ''}
                    onChange={(e) => handleInputChange('organizationSize', e.target.value)}
                    className="w-full px-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    <option value="startup">Startup (1-10)</option>
                    <option value="small">Small (11-50)</option>
                    <option value="medium">Medium (51-200)</option>
                    <option value="large">Large (201-1000)</option>
                    <option value="enterprise">Enterprise (1000+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="organizationIndustry" className="block text-sm font-medium text-muted-700 mb-2">
                  Industry
                </label>
                <input
                  id="organizationIndustry"
                  type="text"
                  value={formData.organizationIndustry || ''}
                  onChange={(e) => handleInputChange('organizationIndustry', e.target.value)}
                  className="w-full px-4 py-3 border border-muted-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Role-specific Information */}
        <div className="mt-4 p-3 bg-muted-50 rounded-lg">
          <p className="text-xs text-muted-600 text-center">
            {formData.role === 'user' 
              ? 'Join thousands of individuals making a positive environmental impact'
              : 'Get enterprise-grade sustainability tracking and ESG reporting for your organization'
            }
          </p>
        </div>
      </Card>
    </div>
  );
};
