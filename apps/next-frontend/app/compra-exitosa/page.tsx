'use client';

import { Suspense } from 'react';
import CompraExitosaContent from './content';
import { CheckCircle } from 'lucide-react';

export default function CompraExitosaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin">
                <CheckCircle size={64} className="text-green-500" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CompraExitosaContent />
    </Suspense>
  );
}
