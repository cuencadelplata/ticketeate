// @ts-nocheck
'use client';

import * as React from 'react';
import type { CategorySettings } from '../types/event-settings';

export function CategoryConfigurationPanel({
  categories,
  onChange,
  isDisabled = false,
}: {
  readonly categories: ReadonlyArray<CategorySettings>;
  readonly onChange: (categories: CategorySettings[]) => void;
  readonly isDisabled?: boolean;
}): React.ReactElement {
  const handleAddCategory = React.useCallback(() => {
    const newCategory: CategorySettings = {
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      maxPerUser: 4,
      maxTotal: 100,
      description: '',
      benefits: [],
      type: 'general',
      isEnabled: true,
    };
    onChange([...categories, newCategory]);
  }, [categories, onChange]);

  const handleUpdateCategory = React.useCallback(
    (index: number, field: keyof CategorySettings, value: any) => {
      const updatedCategories = [...categories];
      updatedCategories[index] = {
        ...updatedCategories[index],
        [field]: value,
      };
      onChange(updatedCategories);
    },
    [categories, onChange]
  );

  const handleDeleteCategory = React.useCallback(
    (index: number) => {
      const updatedCategories = categories.filter((_, i) => i !== index);
      onChange(updatedCategories);
    },
    [categories, onChange]
  );

  const handleAddBenefit = React.useCallback(
    (index: number) => {
      const updatedCategories = [...categories];
      updatedCategories[index] = {
        ...updatedCategories[index],
        benefits: [...updatedCategories[index].benefits, ''],
      };
      onChange(updatedCategories);
    },
    [categories, onChange]
  );

  const handleUpdateBenefit = React.useCallback(
    (categoryIndex: number, benefitIndex: number, value: string) => {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].benefits[benefitIndex] = value;
      onChange(updatedCategories);
    },
    [categories, onChange]
  );

  const handleDeleteBenefit = React.useCallback(
    (categoryIndex: number, benefitIndex: number) => {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].benefits = updatedCategories[categoryIndex].benefits.filter(
        (_, i) => i !== benefitIndex
      );
      onChange(updatedCategories);
    },
    [categories, onChange]
  );

  return (
    <div className="space-y-6" role="region" aria-label="Configuración de categorías">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Categorías de Entradas</h3>
        <button
          onClick={handleAddCategory}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          aria-label="Agregar nueva categoría"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <span>Agregar Categoría</span>
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="rounded-lg border border-stone-700 bg-stone-800/50 p-4 space-y-4"
            role="group"
            aria-label={`Categoría ${category.name || 'sin nombre'}`}
          >
            {/* Encabezado de categoría */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-stone-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-hidden="true"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleUpdateCategory(index, 'name', e.target.value)}
                    placeholder="Nombre de la categoría"
                    disabled={isDisabled}
                    className="rounded-md border-none bg-transparent px-2 py-1 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    id={`category-name-${category.id}`}
                    aria-label="Nombre de la categoría"
                  />
                </div>
                <select
                  value={category.type}
                  onChange={(e) => handleUpdateCategory(index, 'type', e.target.value)}
                  disabled={isDisabled}
                  className="rounded-md border-none bg-stone-700 px-2 py-1 text-sm text-white"
                  id={`category-type-${category.id}`}
                  aria-label="Tipo de categoría"
                >
                  <option value="general">General</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <button
                onClick={() => handleDeleteCategory(index)}
                disabled={isDisabled}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-700 hover:text-white"
                aria-label={`Eliminar categoría ${category.name || 'sin nombre'}`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  role="img"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>

            {/* Detalles de la categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor={`price-${category.id}`} className="text-sm text-stone-400">
                  Precio
                </label>
                <input
                  type="number"
                  id={`price-${category.id}`}
                  value={category.price}
                  onChange={(e) => handleUpdateCategory(index, 'price', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  disabled={isDisabled}
                  className="w-full rounded-lg border border-stone-600 bg-stone-700 px-3 py-1.5 text-white"
                  aria-label="Precio de la categoría"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={`max-total-${category.id}`} className="text-sm text-stone-400">
                  Cantidad total
                </label>
                <input
                  type="number"
                  id={`max-total-${category.id}`}
                  value={category.maxTotal}
                  onChange={(e) => handleUpdateCategory(index, 'maxTotal', Number(e.target.value))}
                  min="1"
                  disabled={isDisabled}
                  className="w-full rounded-lg border border-stone-600 bg-stone-700 px-3 py-1.5 text-white"
                  aria-label="Cantidad total de entradas"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-2">
              <label htmlFor={`description-${category.id}`} className="text-sm text-stone-400">
                Descripción
              </label>
              <textarea
                id={`description-${category.id}`}
                value={category.description}
                onChange={(e) => handleUpdateCategory(index, 'description', e.target.value)}
                placeholder="Describe los beneficios de esta categoría..."
                rows={2}
                disabled={isDisabled}
                className="w-full rounded-lg border border-stone-600 bg-stone-700 px-3 py-1.5 text-white"
                aria-label="Descripción de la categoría"
              />
            </div>

            {/* Beneficios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-400">Beneficios</span>
                <button
                  onClick={() => handleAddBenefit(index)}
                  disabled={isDisabled}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-700 hover:text-white"
                  aria-label="Agregar nuevo beneficio"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Agregar beneficio</span>
                </button>
              </div>
              <div className="space-y-2" role="list" aria-label="Lista de beneficios">
                {category.benefits.map((benefit, benefitIndex) => (
                  <div
                    key={`${category.id}-benefit-${benefitIndex}`}
                    className="flex items-center gap-2"
                    role="listitem"
                  >
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleUpdateBenefit(index, benefitIndex, e.target.value)}
                      placeholder="Describe el beneficio..."
                      disabled={isDisabled}
                      className="flex-1 rounded-lg border border-stone-600 bg-stone-700 px-3 py-1.5 text-sm text-white"
                      id={`${category.id}-benefit-${benefitIndex}`}
                      aria-label={`Beneficio ${benefitIndex + 1}`}
                    />
                    <button
                      onClick={() => handleDeleteBenefit(index, benefitIndex)}
                      disabled={isDisabled}
                      className="rounded-full p-1 text-stone-400 hover:bg-stone-700 hover:text-white"
                      aria-label={`Eliminar beneficio ${benefitIndex + 1}`}
                    >
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        role="img"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}