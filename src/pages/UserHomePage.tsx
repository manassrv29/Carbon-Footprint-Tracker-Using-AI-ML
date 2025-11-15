import React, { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { EnhancedCarbonCalculator } from '../components/calculator/EnhancedCarbonCalculator';
import { CarbonDashboard } from '../components/dashboard/CarbonDashboard';
import { AutoTrackingHub } from '../components/tracking/AutoTrackingHub';
import { WeeklyReport } from '../components/reports/WeeklyReport';
import { MonthlyReport } from '../components/reports/MonthlyReport';
import MLDashboard from '../components/ml/MLDashboard';

// Import the existing components from the original App
function Navigation({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ml-analytics', label: 'AI Analytics' },
    { id: 'autotrack', label: 'Auto-Track' },
    { id: 'weekly-report', label: 'Weekly Report' },
    { id: 'monthly-report', label: 'Monthly Report' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'impact', label: 'Impact' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" style={{ maxWidth: '1600px' }}>
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-lg lg:text-xl">🌱</span>
            </div>
            <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">CarbonTracker</span>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-medium transition-all duration-300 transform hover:scale-105 desktop-nav-item ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-md'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{user?.firstName || 'User'}</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 group"
                  >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16 lg:py-24 xl:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16" style={{ maxWidth: '1600px' }}>
        <div className="text-center">
          <div className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm lg:text-base font-medium mb-8 lg:mb-12 shadow-lg">
            <span className="mr-2">🌱</span>
            Welcome to the future of carbon tracking
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-8 lg:mb-12 leading-tight desktop-heading-xl">
            Measure, Analyze & 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 animate-gradient">
              {' '}Reduce
            </span>
            <br />
            Your Carbon Footprint
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-600 mb-12 lg:mb-16 max-w-5xl mx-auto leading-relaxed font-light desktop-text-lg">
            Bridge the gap between carbon awareness and actionable climate action. 
            Make sustainability tracking <span className="font-semibold text-green-600">automatic</span>, <span className="font-semibold text-emerald-600">insightful</span>, and <span className="font-semibold text-teal-600">engaging</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
            <button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 w-full sm:w-auto text-lg"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Start Tracking Now
              </span>
            </button>
            <button className="border-2 border-green-500 text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 px-10 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto text-lg">
              <span className="flex items-center justify-center">
                <span className="mr-2">📚</span>
                Learn More
              </span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '📊', title: 'Track', description: 'Monitor your daily carbon footprint across transport, food, and energy' },
              { icon: '📈', title: 'Analyze', description: 'Get insights and trends to understand your environmental impact' },
              { icon: '🎯', title: 'Reduce', description: 'Receive personalized recommendations to lower your emissions' }
            ].map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-3xl">
                  <span className="text-3xl filter drop-shadow-lg">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


export const UserHomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();

  // Redirect if not authenticated or wrong role
  if (!user || user.role !== 'user') {
    window.location.href = '/auth';
    return null;
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    setActiveSection('calculator');
    const calculatorElement = document.getElementById('calculator');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
      <main>
        {activeSection === 'home' && (
          <div id="home">
            <Hero onGetStarted={handleGetStarted} />
          </div>
        )}

        {activeSection === 'calculator' && <EnhancedCarbonCalculator />}
        
        {activeSection === 'dashboard' && <CarbonDashboard />}
        
        {activeSection === 'ml-analytics' && <MLDashboard />}
        
        {activeSection === 'autotrack' && <AutoTrackingHub />}
        
        {activeSection === 'weekly-report' && <WeeklyReport />}
        
        {activeSection === 'monthly-report' && <MonthlyReport />}

        {activeSection === 'challenges' && (
          <section id="challenges" className="py-16 lg:py-24 bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center" style={{ maxWidth: '1600px' }}>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 desktop-heading-lg">Challenges</h2>
              <p className="text-gray-600 text-base lg:text-lg xl:text-xl mb-8 lg:mb-12 desktop-text-lg">Join sustainability challenges and compete with others</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {[
                  { title: 'Green Week Challenge', description: 'Use eco-friendly transport for 7 days', progress: 60 },
                  { title: 'Plant-Based October', description: 'Log 20 vegetarian meals this month', progress: 75 }
                ].map((challenge) => (
                  <div key={challenge.title} className="bg-white rounded-lg lg:rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 desktop-card">
                    <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3">{challenge.title}</h3>
                    <p className="text-gray-600 text-base lg:text-lg mb-4 lg:mb-6">{challenge.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3 mb-4 lg:mb-6">
                      <div 
                        className="bg-green-500 h-2 lg:h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm lg:text-base text-gray-600 font-medium">{challenge.progress}% complete</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'impact' && (
          <section id="impact" className="py-16 lg:py-24 bg-white">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center" style={{ maxWidth: '1600px' }}>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 desktop-heading-lg">Your Impact</h2>
              <p className="text-gray-600 text-base lg:text-lg xl:text-xl mb-8 lg:mb-12 desktop-text-lg">See your environmental impact in real-world terms</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                {[
                  { title: 'Trees Needed', value: '3', unit: 'trees', description: 'to offset emissions' },
                  { title: 'Car Distance', value: '245', unit: 'km', description: 'equivalent travel' },
                  { title: 'Energy Saved', value: '12', unit: 'bulb-years', description: '60W for a year' },
                  { title: 'Water Impact', value: '1,850', unit: 'liters', description: 'carbon footprint' }
                ].map((impact) => (
                  <div key={impact.title} className="bg-gray-50 rounded-lg lg:rounded-xl p-6 lg:p-8 hover:bg-gray-100 transition-all duration-300 desktop-card">
                    <h4 className="font-semibold lg:font-bold text-gray-900 text-base lg:text-lg xl:text-xl mb-2 lg:mb-3">{impact.title}</h4>
                    <div className="mb-2 lg:mb-4">
                      <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">{impact.value}</span>
                      <span className="text-sm lg:text-base text-gray-600 ml-1 lg:ml-2">{impact.unit}</span>
                    </div>
                    <p className="text-sm lg:text-base text-gray-600">{impact.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};
