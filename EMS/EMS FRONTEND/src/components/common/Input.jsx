import React from 'react';

const Input = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-danger-500 ml-1">*</span>}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-2.5 
        border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        transition-all duration-200
        placeholder:text-gray-400
        ${error ? 'border-danger-500 focus:ring-danger-500' : ''}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
  </div>
);

export default Input;