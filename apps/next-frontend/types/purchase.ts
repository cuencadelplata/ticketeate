export type PurchaseStatus = 'completed' | 'pending' | 'cancelled' | 'refunded';

export interface Purchase {
  id: string;
  eventId: string;
  eventName: string;
  attendeeName: string;
  email: string;
  totalPrice: number;
  quantity: number;
  status: PurchaseStatus;
  purchaseDate: string;
  validationDate?: string;
  seatNumbers: string[];
  qrCode?: string;
  ticketType?: string;
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}
