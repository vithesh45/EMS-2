import React from 'react';

const Table = ({ columns, data, onRowClick }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse bg-white">
      <thead>
        <tr className="bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-primary-200">
          {columns.map((col, idx) => (
            <th
              key={idx}
              className="px-6 py-4 text-left text-xs font-bold text-primary-900 uppercase tracking-wider"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="font-medium">No data available</p>
              </div>
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                ${onRowClick ? 'hover:bg-primary-50 cursor-pointer' : ''}
                transition-colors duration-150
              `}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;