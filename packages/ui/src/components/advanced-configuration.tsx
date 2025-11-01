import React from 'react';
import { Shield, Tag, UserCheck, File } from 'lucide-react';
import type { AdvancedEventSettings } from '../types/event-settings';

interface AdvancedConfigProps {
  settings: AdvancedEventSettings;
  onChange: (settings: AdvancedEventSettings) => void;
  isDisabled?: boolean;
}

export function AdvancedConfigurationPanel({
  settings,
  onChange,
  isDisabled = false,
}: AdvancedConfigProps) {
  const handleChange = (field: keyof AdvancedEventSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Configuración Avanzada</h3>
      </div>

      <div className="space-y-4">
        {/* Visibilidad del evento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-stone-300">Inicio de visibilidad</label>
            <input
              type="datetime-local"
              value={settings.visibilityStart?.toISOString().slice(0, 16) || ''}
              onChange={(e) => handleChange('visibilityStart', new Date(e.target.value))}
              disabled={isDisabled}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-stone-300">Fin de visibilidad</label>
            <input
              type="datetime-local"
              value={settings.visibilityEnd?.toISOString().slice(0, 16) || ''}
              onChange={(e) => handleChange('visibilityEnd', new Date(e.target.value))}
              disabled={isDisabled}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Límites de compra */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <UserCheck className="h-4 w-4" />
              Máximo por usuario
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxPurchasePerUser}
              onChange={(e) => handleChange('maxPurchasePerUser', parseInt(e.target.value))}
              disabled={isDisabled}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <Tag className="h-4 w-4" />
              Máximo por compra
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxTicketsPerPurchase}
              onChange={(e) => handleChange('maxTicketsPerPurchase', parseInt(e.target.value))}
              disabled={isDisabled}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Opciones de seguridad */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <Shield className="h-4 w-4" />
              Requiere identificación
            </label>
            <input
              type="checkbox"
              checked={settings.requiresIdentification}
              onChange={(e) => handleChange('requiresIdentification', e.target.checked)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <Tag className="h-4 w-4" />
              Permite reventa
            </label>
            <input
              type="checkbox"
              checked={settings.allowsResale}
              onChange={(e) => handleChange('allowsResale', e.target.checked)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <Shield className="h-4 w-4" />
              Alta demanda
            </label>
            <input
              type="checkbox"
              checked={settings.isHighDemand}
              onChange={(e) => handleChange('isHighDemand', e.target.checked)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-stone-900"
            />
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-300">
            <File className="h-4 w-4" />
            Términos y condiciones
          </label>
          <textarea
            value={settings.termsAndConditions}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            disabled={isDisabled}
            rows={4}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Términos y condiciones específicos para este evento..."
          />
        </div>
      </div>
    </div>
  );
}