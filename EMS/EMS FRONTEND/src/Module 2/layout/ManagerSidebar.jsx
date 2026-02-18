import React from 'react';
import { 
  LayoutGrid, // Icon for Dashboard
  ArrowDownToLine, 
  ArrowUpFromLine, 
  LayoutDashboard,
  FileText,
  Truck,
  ClipboardList,
  FolderOpen,
  BarChart3,
  Receipt
} from 'lucide-react';

const ManagerSidebar = ({ currentPage, setCurrentPage }) => {
  const menuSections = [
    // --- ADDED DASHBOARD SECTION ---
    {
      title: 'Home',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, color: 'text-slate-800' },
      ]
    },
    {
      title: 'Stock Management',
      items: [
        { id: 'inward', label: 'Inward', icon: ArrowDownToLine, color: 'text-blue-600' },
        { id: 'outward', label: 'Outward', icon: ArrowUpFromLine, color: 'text-orange-600' },
        { id: 'stock', label: 'Stock', icon: LayoutDashboard, color: 'text-green-600' }
      ]
    },
    {
      title: 'Work Management',
      items: [
        { id: 'dwa', label: 'DWA', icon: FileText, color: 'text-purple-600' },
        { id: 'di', label: 'Delivery Instructions', icon: Truck, color: 'text-cyan-600' },
        { id: 'workorder', label: 'Work Orders', icon: ClipboardList, color: 'text-indigo-600' },
        { id: 'indent', label: 'Indent', icon: FolderOpen, color: 'text-pink-600' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { id: 'inventory', label: 'Inventory', icon: BarChart3, color: 'text-teal-600' },
        { id: 'billing', label: 'Billing', icon: Receipt, color: 'text-amber-600' }
      ]
    }
  ];
  
  return (
    <aside className="w-64 bg-white min-h-screen shadow-sm border-r border-gray-200">
      <nav className="p-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 font-medium text-sm
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : item.color} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default ManagerSidebar;