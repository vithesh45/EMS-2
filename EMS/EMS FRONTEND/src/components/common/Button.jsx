import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
 // Button.jsx (Change these values)
const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
};
  
  return (
    <button
      className={`
        px-4 py-2.5 rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;