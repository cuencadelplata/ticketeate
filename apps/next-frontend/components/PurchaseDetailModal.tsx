'use client';

import { useState } from 'react';
import { X, Download, Calendar, MapPin, Ticket } from 'lucide-react';
import { Purchase } from '@/types/purchase';
import { StatusBadge } from './StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PurchaseDetailModalProps {
  purchase?: Purchase;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function PurchaseDetailModal({
  purchase,
  isOpen,
  onClose,
  onDownload,
}: PurchaseDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!purchase) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      onDownload?.();
    } finally {
      setIsDownloading(false);
    }
  };

  const purchaseDate = new Date(purchase.purchaseDate);
  const formattedDate = formatDistanceToNow(purchaseDate, {
    addSuffix: true,
    locale: es,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalles de la Compra
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-4 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Estado
                </h3>
                <StatusBadge status={purchase.status} date={formattedDate} />
              </div>

              {/* Event Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Evento
                </h3>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {purchase.eventName}
                </p>
              </div>

              {/* Attendee */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Asistente
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{purchase.attendeeName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.email}</p>
              </div>

              {/* Seat Information */}
              {purchase.seatNumbers && purchase.seatNumbers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    <Ticket className="w-4 h-4 inline mr-1" />
                    Asientos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {purchase.seatNumbers.map((seat, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cantidad</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {purchase.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-lg font-semibold text-orange-600">
                    ${purchase.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Comprado: {purchaseDate.toLocaleDateString('es-ES')}
                  </span>
                </div>
                {purchase.validationDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Validado: {new Date(purchase.validationDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
