'use client';

import { Purchase } from '@/types/purchase';
import { PurchaseCard } from './PurchaseCard';

interface PurchaseGridProps {
  purchases: Purchase[];
  isLoading?: boolean;
  onCardClick?: (purchase: Purchase) => void;
  onDownload?: (purchase: Purchase) => void;
}

export function PurchaseGrid({ purchases, isLoading, onCardClick, onDownload }: PurchaseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {purchases.map((purchase) => (
        <PurchaseCard
          key={purchase.id}
          purchase={purchase}
          onClick={() => onCardClick?.(purchase)}
          onDownload={() => onDownload?.(purchase)}
        />
      ))}
    </div>
  );
}
