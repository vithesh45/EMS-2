import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800"
  };

  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center p-4 rounded-lg border-l-4 shadow-lg transition-all animate-in slide-in-from-right ${styles[type]}`}>
      <div className="mr-3">
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <p className="text-sm font-semibold pr-8">{message}</p>
      <button onClick={onClose} className="absolute right-2 top-4 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;