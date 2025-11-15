import React from 'react';
import { Leaf, Github, ExternalLink, Server, Database, Smartphone } from 'lucide-react';

export const FallbackApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Carbon Footprint Tracker</h1>
                <p className="text-sm text-gray-600">AI-Powered Sustainability Platform</p>
              </div>
            </div>
            <a
              href="https://github.com/manassrv29/Carbon-Footprint-Tracker-Using-AI-ML"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>View Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Carbon Footprint Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive AI-powered platform for tracking and optimizing personal and corporate carbon footprints.
            Built with React, TypeScript, Node.js, and Machine Learning.
          </p>
          
          {/* Status Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <Server className="w-5 h-5" />
              <span className="font-medium">Frontend Deployed Successfully!</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              The backend server is not yet deployed. Full functionality will be available once the backend is connected.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Tracking</h3>
            <p className="text-gray-600">
              AI-powered carbon footprint calculation with real-time tracking and analytics.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sustainability Goals</h3>
            <p className="text-gray-600">
              Set and achieve carbon reduction goals with gamification and challenges.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Ready</h3>
            <p className="text-gray-600">
              Responsive design with mobile-first approach for tracking on the go.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 with TypeScript</li>
                <li>• Vite for fast development</li>
                <li>• Tailwind CSS for styling</li>
                <li>• React Router for navigation</li>
                <li>• Chart.js for data visualization</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js with Express</li>
                <li>• SQLite database</li>
                <li>• JWT authentication</li>
                <li>• Machine Learning models</li>
                <li>• Swagger API documentation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Check out the source code and deployment instructions on GitHub.
          </p>
          <a
            href="https://github.com/manassrv29/Carbon-Footprint-Tracker-Using-AI-ML"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Github className="w-5 h-5" />
            <span>View on GitHub</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-emerald-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Carbon Footprint Tracker. Built for sustainability and environmental awareness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
