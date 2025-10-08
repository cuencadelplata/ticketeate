'use client';

import { useState, useEffect } from 'react';
import { Settings, Play, Trash2, Clock } from 'lucide-react';

interface QueueConfig {
  colaid: string;
  eventoid: string;
  maxConcurrent: number;
  maxUsers: number;
  createdAt: string;
  event: {
    titulo: string;
    estado: string;
  };
  totalTurns: number;
}

interface QueueAdminProps {
  eventId: string;
  eventTitle: string;
}

export function QueueAdmin({ eventId, eventTitle }: QueueAdminProps) {
  const [queueConfig, setQueueConfig] = useState<QueueConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxConcurrent, setMaxConcurrent] = useState(10);
  const [maxUsers, setMaxUsers] = useState(1000);

  // Cargar configuración existente
  useEffect(() => {
    loadQueueConfig();
  }, [eventId]);

  const loadQueueConfig = async () => {
    try {
      const response = await fetch(`/api/queue/config?eventId=${eventId}`);
      const data = await response.json();

      if (response.ok) {
        setQueueConfig(data.queueConfig);
        setMaxConcurrent(data.queueConfig.maxConcurrent);
        setMaxUsers(data.queueConfig.maxUsers);
      } else {
        setQueueConfig(null);
      }
    } catch (error) {
      console.error('Error loading queue config:', error);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          maxConcurrent,
          maxUsers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQueueConfig(data.queueConfig);
        alert(`Cola ${data.action === 'created' ? 'creada' : 'actualizada'} exitosamente`);
      } else {
        setError(data.error || 'Error al guardar configuración');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar la configuración de cola?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/config', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        setQueueConfig(null);
        alert('Configuración de cola eliminada');
      } else {
        setError(data.error || 'Error al eliminar configuración');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Cola procesada: ${data.processed} usuarios procesados, ${data.cleanedExpired} reservas limpiadas`,
        );
        loadQueueConfig(); // Recargar configuración
      } else {
        setError(data.error || 'Error al procesar cola');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Configuración de Cola</h3>
        </div>
        {queueConfig && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {queueConfig.totalTurns} turnos registrados
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Evento: {eventTitle}</p>
        <p className="text-xs text-gray-500">ID: {eventId}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máximo Concurrente</label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxConcurrent}
            onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 1)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número máximo de usuarios que pueden comprar simultáneamente
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máximo Usuarios</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={maxUsers}
            onChange={(e) => setMaxUsers(parseInt(e.target.value) || 1)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número máximo de usuarios que pueden estar en la cola
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleSaveConfig}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Clock className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Settings className="h-4 w-4 mr-2" />
          )}
          {queueConfig ? 'Actualizar Configuración' : 'Crear Cola'}
        </button>

        {queueConfig && (
          <>
            <button
              onClick={handleProcessQueue}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-2" />
              Procesar Cola
            </button>

            <button
              onClick={handleDeleteConfig}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cola
            </button>
          </>
        )}
      </div>

      {queueConfig && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Estado Actual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estado del evento:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  queueConfig.event.estado === 'ACTIVO'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {queueConfig.event.estado}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Configurado:</span>
              <span className="ml-2 text-gray-900">
                {new Date(queueConfig.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
