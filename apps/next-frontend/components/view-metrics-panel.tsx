'use client';

import { useState } from 'react';
import { useViewMetrics } from '@/hooks/use-view-metrics';
import { Eye, RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function ViewMetricsPanel() {
  const { stats, isLoading, error, fetchStats, syncViews } = useViewMetrics();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncViews();
      if (result) {
        setLastSync(new Date());
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Error al cargar métricas</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Métricas de Views</h2>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-sm text-gray-500">
              Última sincronización: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando métricas...</span>
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Estadísticas generales */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Pendientes de Sincronizar</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">{stats.pendingSync}</div>
              <div className="text-sm text-gray-500">eventos</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Views Pendientes</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalPendingViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">visitas</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Estado del Sistema</h3>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                {stats.pendingSync === 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Sincronizado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Pendiente</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lista de eventos con views pendientes */}
      {stats && stats.events.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">Eventos con Views Pendientes</h3>
          <div className="space-y-2">
            {stats.events.map((event) => (
              <div
                key={event.eventId}
                className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm text-gray-700">{event.eventId}</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {event.pendingViews.toLocaleString()} views
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">¿Cómo funciona el sistema de views?</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Las views se cuentan automáticamente cuando alguien visita un evento</li>
          <li>• Se previenen conteos duplicados por IP/User Agent por 24 horas</li>
          <li>• Los contadores se almacenan temporalmente en Redis para mejor rendimiento</li>
          <li>
            • La sincronización con la base de datos se ejecuta automáticamente cada 5 minutos
          </li>
          <li>• Puedes sincronizar manualmente usando el botón "Sincronizar"</li>
        </ul>
      </div>
    </div>
  );
}
