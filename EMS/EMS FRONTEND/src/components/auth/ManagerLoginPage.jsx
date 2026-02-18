import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

const ManagerLoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = () => {
    // We pass 'manager' to the hook so it knows to validate manager creds
    if (login(username, password, 'manager')) {
      setError('');
    } else {
      setError('Invalid Manager credentials. Use manager/manager123');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Project Manager</h2>
          <p className="text-gray-600 mt-2">Sign in to manage</p>
        </div>
        
        <div onKeyPress={handleKeyPress}>
          <Input
            label="Manager ID"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter manager username"
          />
          <Input
            label="Security Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter manager password"
          />
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <Button onClick={handleSubmit} className="w-full !bg-indigo-600 hover:!bg-indigo-700">
            Manager Sign In
          </Button>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900 font-medium text-center">Manager Access</p>
            <p className="text-sm text-indigo-700 text-center mt-1">
              User: <span className="font-mono font-bold">manager</span> | Pass: <span className="font-mono font-bold">manager123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;