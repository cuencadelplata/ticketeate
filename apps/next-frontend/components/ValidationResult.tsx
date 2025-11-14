'use client';

import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationResultProps {
  status: 'success' | 'error' | 'duplicate' | 'idle';
  result?: any;
  error?: string;
  onClose?: () => void;
}

export function ValidationResult({ status, result, error, onClose }: ValidationResultProps) {
  const isSuccess = status === 'success';
  const isDuplicate = status === 'duplicate';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mt-4 p-4 rounded-lg border ${
        isSuccess
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : isDuplicate
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        ) : isDuplicate ? (
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3
            className={`font-semibold text-sm ${
              isSuccess
                ? 'text-green-900 dark:text-green-200'
                : isDuplicate
                  ? 'text-yellow-900 dark:text-yellow-200'
                  : 'text-red-900 dark:text-red-200'
            }`}
          >
            {isSuccess
              ? 'Entrada Validada'
              : isDuplicate
                ? 'Entrada Duplicada'
                : 'Error de Validación'}
          </h3>
          {result?.message && (
            <p
              className={`text-xs mt-1 ${
                isSuccess
                  ? 'text-green-700 dark:text-green-300'
                  : isDuplicate
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
              }`}
            >
              {result.message}
            </p>
          )}
          {error && <p className="text-xs mt-1 text-red-700 dark:text-red-300">{error}</p>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-3 w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cerrar
        </button>
      )}
    </motion.div>
  );
}

export default ValidationResult;
