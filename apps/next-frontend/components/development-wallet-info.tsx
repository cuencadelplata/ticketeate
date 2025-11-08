// Componente adicional para mostrar información de desarrollo
export function DevelopmentWalletInfo() {
  return (
    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-md">
      <h4 className="text-sm font-medium text-blue-300 mb-2">🔧 Modo Desarrollo</h4>
      <ul className="text-xs text-blue-400 space-y-1">
        <li>• Billetera simulada activa</li>
        <li>• Los pagos se procesarán automáticamente</li>
        <li>• No se realizarán transacciones reales</li>
        <li>• Perfecto para probar la funcionalidad de venta</li>
      </ul>
    </div>
  );
}
