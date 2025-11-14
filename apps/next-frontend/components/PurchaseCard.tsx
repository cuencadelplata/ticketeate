'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, ChevronRight } from 'lucide-react';
import { Purchase } from '@/types/purchase';
import { StatusBadge } from './StatusBadge';
import { motion } from 'framer-motion';

interface PurchaseCardProps {
  purchase: Purchase;
  onClick?: () => void;
  onDownload?: () => void;
}

export function PurchaseCard({ purchase, onClick, onDownload }: PurchaseCardProps) {
  const formattedDate = formatDistanceToNow(new Date(purchase.purchaseDate), {
    addSuffix: true,
    locale: es,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className="group p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
            {purchase.eventName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {purchase.attendeeName}
          </p>
        </div>
        <StatusBadge status={purchase.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Entradas:</span>
          <span className="font-medium text-gray-900 dark:text-white">{purchase.quantity}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Monto:</span>
          <span className="font-semibold text-orange-600">${purchase.totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-500">{formattedDate}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar
        </button>
        <button
          onClick={onClick}
          className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
