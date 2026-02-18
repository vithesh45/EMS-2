import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ManagerSidebar from './ManagerSidebar';

const ManagerLayout = ({ children, currentPage, setCurrentPage }) => {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Matching Layout.jsx Style */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Project Manager Portal</h1>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      <div className="flex">
        {/* Manager Specific Sidebar */}
        <ManagerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;