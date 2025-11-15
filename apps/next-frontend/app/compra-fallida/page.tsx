'use client';

import { Suspense } from 'react';
import CompraFallidaContent from './content';
import { AlertCircle } from 'lucide-react';

export default function CompraFallidaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin">
                <AlertCircle size={64} className="text-red-500" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CompraFallidaContent />
    </Suspense>
  );
}
