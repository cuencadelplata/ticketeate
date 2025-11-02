import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import type { QueueSettings } from '../types/event-settings';

interface QueueConfigProps {
  settings: QueueSettings;
  onChange: (settings: QueueSettings) => void;
  isDisabled?: boolean;
}

export function QueueConfigurationPanel({
  settings,
  onChange,
  isDisabled = false,
}: QueueConfigProps) {
  const handleChange = (field: keyof QueueSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Configuración de Cola</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400">Habilitar cola</span>
          <input
            type="checkbox"
            checked={settings.isQueueEnabled}
            onChange={(e) => handleChange('isQueueEnabled', e.target.checked)}
            disabled={isDisabled}
            className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-900"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Usuarios concurrentes */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-300">
            <Users className="h-4 w-4" />
            Usuarios simultáneos máximos
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={settings.maxConcurrentUsers}
            onChange={(e) => handleChange('maxConcurrentUsers', parseInt(e.target.value))}
            disabled={isDisabled || !settings.isQueueEnabled}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="text-xs text-stone-400">
            Número máximo de usuarios que pueden realizar la compra simultáneamente
          </p>
        </div>

        {/* Longitud máxima de cola */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-300">
            <Users className="h-4 w-4" />
            Longitud máxima de cola
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={settings.maxQueueLength}
            onChange={(e) => handleChange('maxQueueLength', parseInt(e.target.value))}
            disabled={isDisabled || !settings.isQueueEnabled}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="text-xs text-stone-400">
            Cantidad máxima de usuarios que pueden esperar en la cola
          </p>
        </div>

        {/* Tiempo estimado por usuario */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-300">
            <Clock className="h-4 w-4" />
            Tiempo por usuario (segundos)
          </label>
          <input
            type="number"
            min="60"
            max="900"
            value={settings.processingTimePerUser}
            onChange={(e) => handleChange('processingTimePerUser', parseInt(e.target.value))}
            disabled={isDisabled || !settings.isQueueEnabled}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="text-xs text-stone-400">
            Tiempo estimado que cada usuario tendrá para completar su compra
          </p>
        </div>

        {/* Horario de cola */}
        <div className="flex flex-col gap-4">
          <h4 className="flex items-center gap-2 text-sm text-stone-300">
            <Calendar className="h-4 w-4" />
            Horario de cola
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-stone-400">Inicio</label>
              <input
                type="datetime-local"
                value={settings.queueStartTime?.toISOString().slice(0, 16) || ''}
                onChange={(e) => handleChange('queueStartTime', new Date(e.target.value))}
                disabled={isDisabled || !settings.isQueueEnabled}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-stone-400">Fin</label>
              <input
                type="datetime-local"
                value={settings.queueEndTime?.toISOString().slice(0, 16) || ''}
                onChange={(e) => handleChange('queueEndTime', new Date(e.target.value))}
                disabled={isDisabled || !settings.isQueueEnabled}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
