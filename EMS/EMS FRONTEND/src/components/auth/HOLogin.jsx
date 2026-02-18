import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Lock, User } from 'lucide-react';

const HOLoginPage = () => {
  // Changed state name from email to username to match logic
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Passes (username, password, role) to your AuthContext
    const success = await login(username, password, 'ho'); 
    
    if (!success) {
      alert("Invalid Head Office Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-indigo-900 rounded-2xl mb-4 text-white">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Head Office Login</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-900" 
                placeholder="Enter your username" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-900" 
                placeholder="Enter your password" 
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-800 transition-all shadow-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default HOLoginPage;