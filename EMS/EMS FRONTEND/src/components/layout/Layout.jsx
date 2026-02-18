import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';

const Layout = ({ children, currentPage, setCurrentPage }) => {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Store Stock Management</h1>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      <div className="flex">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;