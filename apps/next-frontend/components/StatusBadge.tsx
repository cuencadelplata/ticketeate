'use client';

import { CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { PurchaseStatus } from '@/types/purchase';

interface StatusBadgeProps {
  status: PurchaseStatus;
  date?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    label: 'Completada',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-500/50',
  },
  pending: {
    icon: Clock,
    label: 'Pendiente',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/50',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelada',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/50',
  },
  refunded: {
    icon: RotateCcw,
    label: 'Reembolsada',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-500/50',
  },
};

export function StatusBadge({ status, date }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor}`}
    >
      <Icon className={`w-4 h-4 ${config.textColor}`} />
      <span className={`text-xs font-semibold ${config.textColor}`}>{config.label}</span>
      {date && <span className={`text-xs ${config.textColor} opacity-75`}>{date}</span>}
    </div>
  );
}
