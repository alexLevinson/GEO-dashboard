import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import './index.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🎯 AppContent render:', { isAuthenticated, loading });

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  console.log('🎯 Loading complete, showing:', isAuthenticated ? 'Dashboard' : 'AuthForm');
  return isAuthenticated ? <Dashboard /> : <AuthForm />;
};

const App: React.FC = () => {
  console.log('🏠 App component rendering...');
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;