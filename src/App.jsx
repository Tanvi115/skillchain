import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from './components/ui/toaster';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TaskMarketplace from './pages/TaskMarketplace.jsx';
import EmployerDashboard from './pages/EmployerDashboard.jsx';
import FreelancerProfile from './pages/FreelancerProfile.jsx';
import CompanyProfile from './pages/CompanyProfile.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Freelancer Routes */}
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute requireRole="freelancer">
                <TaskMarketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-tasks" 
            element={
              <ProtectedRoute requireRole="freelancer">
                <FreelancerProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Company Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole="company">
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/posted-tasks" 
            element={
              <ProtectedRoute requireRole="company">
                <CompanyProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile Routes */}
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <FreelancerProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;