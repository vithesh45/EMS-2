import { useContext } from 'react';
import { StockContext } from '../context/StockContext';

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
};