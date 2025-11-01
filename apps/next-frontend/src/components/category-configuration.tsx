'use client';

import * as React from 'react';
import type { CategorySettings } from '../types/event-settings';

interface CategoryConfigProps {
  readonly categories: ReadonlyArray<CategorySettings>;
  readonly onChange: (categories: CategorySettings[]) => void;
  readonly isDisabled?: boolean;
}

export function CategoryConfigurationPanel({
  categories,
  onChange,
  isDisabled = false,
}: CategoryConfigProps): React.ReactElement {
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
    <section className="space-y-6" aria-label="Configuración de categorías">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Categorías de Entradas</h3>
        <button
          onClick={handleAddCategory}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          aria-label="Agregar nueva categoría"
        >
          <img
            src="/icons/ticket.svg"
            alt=""
            className="h-4 w-4"
            aria-hidden="true"
          />
          <span>Agregar Categoría</span>
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((category, index) => (
          <fieldset
            key={category.id}
            className="rounded-lg border border-stone-700 bg-stone-800/50 p-4 space-y-4"
            aria-label={`Categoría ${category.name || 'sin nombre'}`}
          >
            {/* Encabezado de categoría */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/tag.svg"
                    alt=""
                    className="h-4 w-4 text-stone-400"
                    aria-hidden="true"
                  />
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
                <img
                  src="/icons/trash.svg"
                  alt=""
                  className="h-4 w-4"
                  aria-hidden="true"
                />
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
                  <img
                    src="/icons/edit.svg"
                    alt=""
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                  <span>Agregar beneficio</span>
                </button>
              </div>
              <ul className="space-y-2" aria-label="Lista de beneficios">
                {category.benefits.map((benefit, benefitIndex) => (
                  <li
                    key={`${category.id}-benefit-${benefitIndex}`}
                    className="flex items-center gap-2"
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
                      <img
                        src="/icons/trash.svg"
                        alt=""
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}