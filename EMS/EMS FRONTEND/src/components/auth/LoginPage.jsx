import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = () => {
    if (login(username, password)) {
      setError('');
    } else {
      setError('Invalid credentials. Use admin/admin123');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Stock Management</h2>
          <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <div onKeyPress={handleKeyPress}>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          
          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <Button onClick={handleSubmit} className="w-full">
            Sign In
          </Button>
          
          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-900 font-medium text-center">
              Demo Credentials
            </p>
            <p className="text-sm text-primary-700 text-center mt-1">
              Username: <span className="font-mono font-bold">admin</span> | 
              Password: <span className="font-mono font-bold">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;