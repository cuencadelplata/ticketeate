'use client';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow dark:bg-neutral-900">
        <SwaggerUI
          url="/openapi.json"
          docExpansion="none"
          defaultModelsExpandDepth={-1}
          // cookies de la sesion

          requestInterceptor={(req: any) => {
            req.credentials = 'include';
            return req;
          }}
        />
      </div>
    </div>
  );
}
