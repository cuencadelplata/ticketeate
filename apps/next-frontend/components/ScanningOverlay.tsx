'use client';

import { useCallback, useRef, useEffect } from 'react';

export function ScanningOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const lineWidth = 3;
      const cornerLength = width * 0.1;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.8)'; // orange-600 with alpha
      ctx.lineWidth = lineWidth;

      // Draw corner brackets
      // Top-left
      ctx.beginPath();
      ctx.moveTo(0, cornerLength);
      ctx.lineTo(0, 0);
      ctx.lineTo(cornerLength, 0);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - cornerLength, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, cornerLength);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(0, height - cornerLength);
      ctx.lineTo(0, height);
      ctx.lineTo(cornerLength, height);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - cornerLength, height);
      ctx.lineTo(width, height);
      ctx.lineTo(width, height - cornerLength);
      ctx.stroke();

      // Animated center line
      const time = (Date.now() % 2000) / 2000;
      const lineY = height * 0.25 + time * (height * 0.5);
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cornerLength, lineY);
      ctx.lineTo(width - cornerLength, lineY);
      ctx.stroke();
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animationId = setInterval(animate, 16);
    animate();

    return () => clearInterval(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

export default ScanningOverlay;
