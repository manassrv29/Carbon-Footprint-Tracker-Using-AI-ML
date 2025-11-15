import { TrendingDown, BarChart3, Target, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const features = [
    {
      icon: BarChart3,
      title: 'Track',
      description: 'Monitor your daily carbon footprint across transport, food, and energy'
    },
    {
      icon: TrendingDown,
      title: 'Analyze',
      description: 'Get insights and trends to understand your environmental impact'
    },
    {
      icon: Target,
      title: 'Reduce',
      description: 'Receive personalized recommendations to lower your emissions'
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-success-50 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Carbon Tracking</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Measure, Analyze & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-success-600">
                {' '}Reduce
              </span>
              <br />
              Your Carbon Footprint
            </h1>
            
            <p className="text-xl text-muted-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Bridge the gap between carbon awareness and actionable climate action. 
              Make sustainability tracking automatic, insightful, and engaging with our 
              intelligent platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="w-full sm:w-auto"
            >
              Start Tracking Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-success-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
