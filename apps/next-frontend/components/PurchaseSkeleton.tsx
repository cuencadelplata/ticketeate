'use client';

import { motion } from 'framer-motion';

export function PurchaseSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    </motion.div>
  );
}

export function PurchaseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <PurchaseSkeleton key={i} />
      ))}
    </div>
  );
}
