import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import ManagerLoginPage from './components/auth/ManagerLoginPage';
import HOLogin from './components/auth/HOLogin';

// Dashboard & Layouts
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import ManagerLayout from './Module 2/layout/ManagerLayout';

// Modules
import InwardModule from './components/inward/InwardModule';
import OutwardModule from './components/outward/OutwardModule';
import StockDashboard from './components/stock/StockDashboard';
import DWAModule from './Module 2/dwa/DWAModule';
import DIModule from './Module 2/DeliveryInstructions/DIModule';
import WorkOrderModule from './Module 2/workOrder/WorkOrderModule';
import IndentModule from './Module 2/indent/IndentModule';
import InventoryModule from './Module 2/inventory/InventoryModule';
import BillingModule from './Module 2/billing/BillingModule';

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');
  
  const pathname = window.location.pathname;
  const isManagerRoute = pathname.includes('/manager');
  const isHORoute = pathname.includes('/ho');

  // Prevent flicker while checking LocalStorage
  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Access...</div>;

  // --- EDGE CASE 1: STRICT AUTH GUARD ---
  if (!isAuthenticated) {
    if (isHORoute) return <HOLogin />;
    if (isManagerRoute) return <ManagerLoginPage />;
    return <LoginPage />; // Default fallback for any other route
  }


  // HEAD OFFICE WORLD
  if (user?.role === 'ho') {
    return (
      <ManagerLayout currentPage={currentModule} setCurrentPage={setCurrentModule}>
        <div className="relative h-full">
          <div className="absolute top-0 right-0 m-4 z-50">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm animate-pulse">
              VIEW ONLY MODE
            </span>
          </div>

          {currentModule === 'dashboard' && <Dashboard />}
          {currentModule === 'stock' && <StockDashboard readOnly={true} />}
          {currentModule === 'inward' && <InwardModule readOnly={true} />}
          {currentModule === 'outward' && <OutwardModule readOnly={true} />}
          {currentModule === 'dwa' && <DWAModule readOnly={true} />}
          {currentModule === 'di' && <DIModule readOnly={true} />}
          {currentModule === 'workorder' && <WorkOrderModule readOnly={true} />}
          {currentModule === 'indent' && <IndentModule readOnly={true} />}
          {currentModule === 'inventory' && <InventoryModule readOnly={true} />}
          {currentModule === 'billing' && <BillingModule readOnly={true} />}
        </div>
      </ManagerLayout>
    );
  }

  // MANAGER WORLD
  if (user?.role === 'manager') {
    return (
      <ManagerLayout currentPage={currentModule} setCurrentPage={setCurrentModule}>
        {currentModule === 'dashboard' && <Dashboard />}
        {currentModule === 'stock' && <StockDashboard />}
        {currentModule === 'inward' && <InwardModule />}
        {currentModule === 'outward' && <OutwardModule />}
        {currentModule === 'dwa' && <DWAModule />}
        {currentModule === 'di' && <DIModule />}
        {currentModule === 'workorder' && <WorkOrderModule />}
        {currentModule === 'indent' && <IndentModule />}
        {currentModule === 'inventory' && <InventoryModule />}
        {currentModule === 'billing' && <BillingModule />}
      </ManagerLayout>
    );
  }

  // ADMIN WORLD (Strictly restricted to Stock/Inward/Outward)
  return (
    <Layout currentPage={currentModule} setCurrentPage={setCurrentModule}>
      {/* Ensure Admin doesn't get stuck on 'dashboard' module which doesn't exist for them */}
      {(currentModule === 'stock' || currentModule === 'dashboard') && <StockDashboard />}
      {currentModule === 'inward' && <InwardModule />}
      {currentModule === 'outward' && <OutwardModule />}
    </Layout>
  );
};

export default App;