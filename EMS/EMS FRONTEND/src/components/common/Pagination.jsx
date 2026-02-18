import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
    <div className="text-sm font-medium text-gray-700">
      Page <span className="font-bold text-primary-600">{currentPage}</span> of{' '}
      <span className="font-bold">{totalPages}</span>
    </div>
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2"
      >
        <ChevronLeft size={20} />
      </Button>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  </div>
);

export default Pagination;