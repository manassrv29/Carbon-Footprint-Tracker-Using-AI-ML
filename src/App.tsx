import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FallbackApp } from './components/FallbackApp';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { CorporateHomePage } from './pages/CorporateHomePage';
import { UserHomePage } from './pages/UserHomePage';
import './App.css';

function App() {
  // Check if we're in production and show fallback if backend is not available
  const isProduction = import.meta.env.PROD;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  // If in production and no API URL is set, show the fallback app
  if (isProduction && (!apiBaseUrl || apiBaseUrl.includes('your-backend-url'))) {
    return <FallbackApp />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Role-based protected routes */}
              <Route path="/user/home" element={<UserHomePage />} />
              <Route path="/corporate/home" element={<CorporateHomePage />} />
              
              {/* Default redirect to auth */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
