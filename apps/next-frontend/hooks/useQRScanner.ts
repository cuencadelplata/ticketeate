'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { ScannerResult, ValidationResponse } from '@/types/scanner';

interface UseQRScannerProps {
  onSuccess?: (result: ValidationResponse) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useQRScanner({ onSuccess, onError, enabled = true }: UseQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const lastScanRef = useRef<number>(0);
  const scanIntervalRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'mediaDevices' in navigator);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported || !videoRef.current || !canvasRef.current) return;

    try {
      setIsScanning(true);
      const constraints = {
        audio: false,
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Start scanning interval
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current || !enabled) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            const now = Date.now();
            if (now - lastScanRef.current > 500) {
              // Debounce 500ms
              lastScanRef.current = now;
              onSuccess?.(code.data as any);
            }
          }
        } catch (error) {
          console.error('QR scan error:', error);
        }
      }, 100);
    } catch (error) {
      setIsScanning(false);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          onError?.('PERMISSION_DENIED');
        } else if (error.name === 'NotFoundError') {
          onError?.('DEVICE_NOT_FOUND');
        } else if (error.name === 'NotSupportedError') {
          onError?.('NOT_SUPPORTED');
        }
      }
    }
  }, [isSupported, enabled, onSuccess, onError]);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  return {
    videoRef,
    canvasRef,
    isScanning,
    isSupported,
    startScanning,
    stopScanning,
  };
}
