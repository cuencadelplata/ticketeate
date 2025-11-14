import { Purchase, PurchaseFilters } from '@/types/purchase';

export function filterPurchases(purchases: Purchase[], filters: PurchaseFilters): Purchase[] {
  let result = [...purchases];

  if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.eventName.toLowerCase().includes(search) ||
        p.attendeeName.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search),
    );
  }

  if (filters.startDate) {
    const startDate = new Date(filters.startDate).getTime();
    result = result.filter((p) => new Date(p.purchaseDate).getTime() >= startDate);
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate).getTime();
    result = result.filter((p) => new Date(p.purchaseDate).getTime() <= endDate);
  }

  return sortPurchases(result, filters.sortBy, filters.sortOrder);
}

export function sortPurchases(
  purchases: Purchase[],
  sortBy: string = 'date',
  sortOrder: 'asc' | 'desc' = 'desc',
): Purchase[] {
  const sorted = [...purchases];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        break;
      case 'price':
        compareValue = a.totalPrice - b.totalPrice;
        break;
      case 'name':
        compareValue = a.eventName.localeCompare(b.eventName);
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

export function groupPurchasesByMonth(purchases: Purchase[]): Map<string, Purchase[]> {
  const grouped = new Map<string, Purchase[]>();

  purchases.forEach((purchase) => {
    const date = new Date(purchase.purchaseDate);
    const key = date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
    });

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(purchase);
  });

  return grouped;
}

export function calculatePurchaseStats(purchases: Purchase[]) {
  return {
    total: purchases.length,
    totalSpent: purchases.reduce((sum, p) => sum + p.totalPrice, 0),
    byStatus: {
      completed: purchases.filter((p) => p.status === 'completed').length,
      pending: purchases.filter((p) => p.status === 'pending').length,
      cancelled: purchases.filter((p) => p.status === 'cancelled').length,
      refunded: purchases.filter((p) => p.status === 'refunded').length,
    },
  };
}
