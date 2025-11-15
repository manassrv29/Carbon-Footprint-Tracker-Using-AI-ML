import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Award, BarChart3, Leaf, Target, ChevronDown, User, LogOut } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthProvider';

interface Organization {
  id: number;
  name: string;
  domain: string;
  industry: string;
  size: string;
  employeeCount: number;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  ecoPoints: number;
  streak: number;
  totalCo2Saved: number;
}

interface DashboardMetrics {
  totalEmployees: number;
  totalCarbonLogs: number;
  totalCo2Saved: number;
  totalEcoPoints: number;
  averageCo2PerEmployee: number;
}

interface DashboardData {
  organization: Organization;
  metrics: DashboardMetrics;
  employees: Employee[];
}

const CorporateDashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/corporate/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-600">Loading corporate dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-muted-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { organization, metrics, employees } = dashboardData;

  return (
    <div className="min-h-screen bg-muted-50">
      {/* Header */}
      <div className="bg-white border-b border-muted-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-muted-900">{organization.name}</h1>
                <p className="text-muted-600">{organization.industry} • {organization.size}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <BarChart3 size={16} className="mr-2" />
                Analytics
              </Button>
              <Button size="sm">
                <Target size={16} className="mr-2" />
                Set Goals
              </Button>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span>{user?.firstName || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-muted-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-muted-100">
                      <p className="text-sm font-medium text-muted-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-muted-700 hover:bg-muted-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">Total Employees</p>
                <p className="text-2xl font-bold text-muted-900">{metrics.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">CO₂ Saved</p>
                <p className="text-2xl font-bold text-muted-900">{metrics.totalCo2Saved.toFixed(1)} kg</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">Total Eco Points</p>
                <p className="text-2xl font-bold text-muted-900">{metrics.totalEcoPoints.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">Avg per Employee</p>
                <p className="text-2xl font-bold text-muted-900">{metrics.averageCo2PerEmployee.toFixed(1)} kg</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-muted-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {employees
                .sort((a, b) => b.ecoPoints - a.ecoPoints)
                .slice(0, 5)
                .map((employee, index) => (
                  <div key={employee.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-muted-100 text-muted-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-muted-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-600">Level {employee.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-muted-900">{employee.ecoPoints.toLocaleString()}</p>
                      <p className="text-sm text-muted-600">eco points</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-muted-900 mb-4">Team Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-600">Active Employees</span>
                <span className="font-medium text-muted-900">{metrics.totalEmployees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-600">Total Carbon Logs</span>
                <span className="font-medium text-muted-900">{metrics.totalCarbonLogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-600">Average Streak</span>
                <span className="font-medium text-muted-900">
                  {employees.length > 0 
                    ? Math.round(employees.reduce((sum, emp) => sum + emp.streak, 0) / employees.length)
                    : 0
                  } days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-600">CO₂ Impact</span>
                <span className="font-medium text-green-600">-{metrics.totalCo2Saved.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-muted-200">
              <Button className="w-full" variant="outline">
                View Detailed Analytics
              </Button>
            </div>
          </Card>
        </div>

        {/* Employee List */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-muted-900">All Employees</h3>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-muted-200">
                  <th className="text-left py-3 px-4 font-medium text-muted-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-600">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-600">Eco Points</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-600">Streak</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-600">CO₂ Saved</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-muted-100 hover:bg-muted-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-muted-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-600">{employee.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-900">{employee.level}</td>
                    <td className="py-3 px-4 text-muted-900">{employee.ecoPoints.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-900">{employee.streak} days</td>
                    <td className="py-3 px-4 text-green-600">{employee.totalCo2Saved.toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { CorporateDashboard };
