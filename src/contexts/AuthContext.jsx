import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const register = async (email, password, username, role, company_name = '') => {
    const data = {
      email,
      password,
      passwordConfirm: password,
      username,
      role,
      company_name: role === 'company' ? company_name : '',
      skillScore: 0,
      totalTokensEarned: 0,
      totalTokensSpent: 0,
      rejectionCount: 0
    };

    const record = await pb.collection('users').create(data);
    return record;
  };

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    return authData.record;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const isAuthenticated = pb.authStore.isValid;

  const isFreelancer = currentUser?.role === 'freelancer';
  const isCompany = currentUser?.role === 'company';

  const getTokenBalance = () => {
    if (!currentUser) return 0;
    return (currentUser.totalTokensEarned || 0) - (currentUser.totalTokensSpent || 0);
  };

  const refreshUser = async () => {
    if (currentUser) {
      const updated = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
      setCurrentUser(updated);
      return updated;
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAuthenticated,
    isFreelancer,
    isCompany,
    getTokenBalance,
    refreshUser,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};