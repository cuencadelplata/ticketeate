'use client';

import { Suspense } from 'react';
import ConfiguracionContent from './content';
import { Loader2 } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ConfiguracionContent />
    </Suspense>
  );
}
