import axios from 'axios';
import { Purchase, PurchaseFilters } from '@/types/purchase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PURCHASES_API_URL = `${API_BASE}/api/compras/historial`;
const PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PURCHASES_PAGE_SIZE || '12', 10);

export interface PurchaseHistory {
  success: boolean;
  purchases: Array<{
    id: string;
    eventId: string;
    eventName: string;
    eventImage?: string;
    category: string;
    date: string;
    ticketCount: number;
    ticketType: string;
    totalPrice: number;
    currency: string;
    status: string;
    purchaseDate: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PurchaseDetailsResponse {
  success: boolean;
  purchase: {
    id: string;
    eventId: string;
    eventName: string;
    eventImage?: string;
    gallery?: string[];
    category: string;
    date: string;
    time: string;
    venue: string;
    address?: string;
    description?: string;
    ticketCount: number;
    ticketType: string;
    totalPrice: number;
    currency: string;
    status: string;
    purchaseDate: string;
    orderId: string;
    tickets: Array<{
      id: string;
      qrCode: string;
      validated: boolean;
    }>;
  };
}

export async function fetchPurchases(
  userId: string,
  page: number = 1,
  filters?: PurchaseFilters,
): Promise<PurchaseHistory> {
  try {
    const params = {
      usuario_id: userId,
      page,
      limit: PAGE_SIZE,
      ...filters,
    };
    const response = await axios.get<PurchaseHistory>(PURCHASES_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
}

export async function fetchPurchaseById(id: string): Promise<PurchaseDetailsResponse> {
  try {
    const url = `${API_BASE}/api/compras/get-details`;
    const response = await axios.get<PurchaseDetailsResponse>(url, {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase ${id}:`, error);
    throw error;
  }
}

export async function downloadPurchaseTicket(id: string): Promise<Blob> {
  try {
    const response = await axios.get(`${PURCHASES_API_URL}/${id}/ticket`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading ticket ${id}:`, error);
    throw error;
  }
}

export const purchaseApi = {
  fetchPurchases,
  fetchPurchaseById,
  downloadPurchaseTicket,
};
