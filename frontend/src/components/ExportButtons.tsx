import React from 'react';
import { exportToCsv } from '../utils/exportCsv';
import { exportToPdf } from '../utils/exportPdf';
import { FileDown, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  title: string;
  headers: string[];
  data: any[][];
}

export function ExportButtons({ title, headers, data }: ExportButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => exportToCsv(title.toLowerCase().replace(/\s+/g, '_'), headers, data)}
        className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        <span>Export CSV</span>
      </button>
      <button
        onClick={() => exportToPdf(title, headers, data)}
        className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
      >
        <FileDown className="h-3.5 w-3.5" />
        <span>Export PDF</span>
      </button>
    </div>
  );
}
export default ExportButtons;
