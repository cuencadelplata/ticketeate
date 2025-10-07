export default function TestHistorial() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎫 Test Historial</h1>
        <p className="text-gray-400">
          Esta página es para probar que las rutas funcionan correctamente
        </p>
        <div className="mt-8">
          <a
            href="/historial"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Ir a Historial Real
          </a>
        </div>
      </div>
    </div>
  );
}
