import axios, { AxiosError } from 'axios';
import { ValidationResponse } from '@/types/scanner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SCANNER_API_URL = `${API_BASE}/api/tickets/enqueue/validate`;
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_QRCODE_TIMEOUT || '3000', 10);

export interface ScannerValidateRequest {
  code: string;
  eventId?: string;
}

export interface ScannerStats {
  eventId: string;
  eventName: string;
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  duplicateScans: number;
  entriesRemaining: number;
  scanRate: string;
  averageScanTime: string;
  lastScan: string | null;
}

export async function validateQRCode(code: string, eventId?: string): Promise<ValidationResponse> {
  try {
    const response = await axios.post<ValidationResponse>(
      SCANNER_API_URL,
      { code, eventId },
      { timeout: TIMEOUT },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        throw new Error('DUPLICATE_SCAN');
      } else if (error.response?.status === 404) {
        throw new Error('TICKET_NOT_FOUND');
      } else if (error.response?.status === 400) {
        throw new Error('INVALID_TICKET');
      }
    }
    throw error;
  }
}

export async function getScannerStats(eventId: string, date?: string): Promise<ScannerStats> {
  try {
    const statsUrl = `${API_BASE}/api/tickets/enqueue/stats`;
    const response = await axios.get<{ success: boolean } & ScannerStats>(statsUrl, {
      params: { eventId, date },
      timeout: TIMEOUT,
    });
    return response.data as ScannerStats;
  } catch (error) {
    console.error('Error fetching scanner stats:', error);
    throw error;
  }
}

export const scannerApi = {
  validateQRCode,
  getScannerStats,
};
