import React, { useRef } from 'react';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import Button from '../../components/common/Button';
import BillPDF from './BillPDF';

const BillPreview = ({ indent, onBack }) => {
  const componentRef = useRef();

  const handleDownload = () => {
    // This triggers the browser's print dialog
    // We use a CSS @media print block to hide the UI and sidebar
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Control Bar - Hidden during printing */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-200 no-print">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 font-bold transition-colors">
          <ChevronLeft size={20} /> Back to List
        </button>
        
        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex items-center gap-2 shadow-lg shadow-blue-100">
            <Printer size={18} /> Print & Download Bill
          </Button>
        </div>
      </div>
      
      {/* Container for the PDF Table */}
      <div className="max-w-4xl mx-auto shadow-2xl bg-white print:shadow-none print:m-0">
        <BillPDF ref={componentRef} indent={indent} />
      </div>

      {/* CSS Guard: Ensures only BillPDF prints */}
      <style>{`
        @media print {
          /* Hide EVERYTHING */
          body * {
            visibility: hidden;
          }
          /* Show ONLY the printable content */
          #printable-bill, #printable-bill * {
            visibility: visible;
          }
          #printable-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          /* Remove sidebar/navbar specifically if they have these classes */
          aside, nav, header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillPreview;