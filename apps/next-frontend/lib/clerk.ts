// Configuración de Clerk para Next.js 15
export const clerkConfigOptions = {
  // Configuración personalizada si es necesaria
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  // Configuración de idioma
  localization: {
    locale: 'es-ES',
  },
  // Configuración adicional para el tema y comportamiento
  appearance: {
    variables: {
      colorPrimary: '#3B82F6',
      colorText: '#FFFFFF',
      colorTextSecondary: '#9CA3AF',
      colorBackground: 'transparent',
      colorInputBackground: '#2C2C2E',
      colorInputText: '#FFFFFF',
      colorInputPlaceholderText: '#9CA3AF',
    },
  },
};

// Función helper para verificar si Clerk está configurado
export const isClerkConfigured = () => {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
};
