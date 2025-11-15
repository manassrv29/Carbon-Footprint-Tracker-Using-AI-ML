import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { CorporateHomePage } from './pages/CorporateHomePage';
import { UserHomePage } from './pages/UserHomePage';
import './App.css';

function App() {
  return (
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
  );
}

export default App;
