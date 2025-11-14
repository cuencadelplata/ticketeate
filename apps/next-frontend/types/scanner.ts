export interface ScannerResult {
  code: string;
  timestamp: number;
  isValid: boolean;
}

export interface ValidationResponse {
  success: boolean;
  ticketId: string;
  eventName: string;
  attendeeName: string;
  seatNumber: string;
  validationTime: string;
  message: string;
}

export type ScannerStatus =
  | 'idle'
  | 'scanning'
  | 'validating'
  | 'success'
  | 'error'
  | 'duplicate'
  | 'permission_denied';

export interface ScannerState {
  status: ScannerStatus;
  result?: ValidationResponse;
  error?: string;
  lastScanTime?: number;
}
