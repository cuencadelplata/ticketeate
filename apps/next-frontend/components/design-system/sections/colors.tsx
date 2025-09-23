'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const colorPalette = [
  { name: 'Orange 50', hex: '#fff7ed', rgb: 'rgb(255, 247, 237)' },
  { name: 'Orange 100', hex: '#ffedd5', rgb: 'rgb(255, 237, 213)' },
  { name: 'Orange 200', hex: '#fed7aa', rgb: 'rgb(254, 215, 170)' },
  { name: 'Orange 300', hex: '#fdba74', rgb: 'rgb(253, 186, 116)' },
  { name: 'Orange 400', hex: '#fb923c', rgb: 'rgb(251, 146, 60)' },
  { name: 'Orange 500', hex: '#f97316', rgb: 'rgb(249, 115, 22)' },
  { name: 'Orange 600', hex: '#ea580c', rgb: 'rgb(234, 88, 12)' },
  { name: 'Orange 700', hex: '#c2410c', rgb: 'rgb(194, 65, 12)' },
  { name: 'Orange 800', hex: '#9a3412', rgb: 'rgb(154, 52, 18)' },
  { name: 'Orange 900', hex: '#7c2d12', rgb: 'rgb(124, 45, 18)' },
];

const neutrals = [
  { name: 'Stone 50', hex: '#fafaf9', rgb: 'rgb(250, 250, 249)' },
  { name: 'Stone 100', hex: '#f5f5f4', rgb: 'rgb(245, 245, 244)' },
  { name: 'Stone 200', hex: '#e7e5e4', rgb: 'rgb(231, 229, 228)' },
  { name: 'Stone 300', hex: '#d6d3d1', rgb: 'rgb(214, 211, 209)' },
  { name: 'Stone 400', hex: '#a8a29e', rgb: 'rgb(168, 162, 158)' },
  { name: 'Stone 500', hex: '#78716c', rgb: 'rgb(120, 113, 108)' },
  { name: 'Stone 600', hex: '#57534e', rgb: 'rgb(87, 83, 78)' },
  { name: 'Stone 700', hex: '#44403c', rgb: 'rgb(68, 64, 60)' },
  { name: 'Stone 800', hex: '#292524', rgb: 'rgb(41, 37, 36)' },
  { name: 'Stone 900', hex: '#1c1917', rgb: 'rgb(28, 25, 23)' },
];

export function ColorsSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorGrid = ({ colors, title }: { colors: typeof colorPalette; title: string }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="grid grid-cols-5 gap-3">
        {colors.map((color) => (
          <div key={color.name} className="group">
            <div
              className="w-full h-16 rounded-lg mb-2 cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex)}
            />
            <div className="text-xs">
              <div className="font-medium text-stone-300">{color.name}</div>
              <div
                className="text-stone-500 cursor-pointer hover:text-stone-300 flex items-center gap-1"
                onClick={() => copyToClipboard(color.hex)}
              >
                {color.hex}
                {copiedColor === color.hex ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="colors"
      className="bg-stone-900 rounded-xl p-6 border border-stone-800 md:col-span-2"
    >
      <h2 className="text-2xl font-semibold mb-4">Colores</h2>
      <p className="text-stone-400 mb-6">
        Paleta de colores principal basada en naranjas vibrantes.
      </p>

      <ColorGrid colors={colorPalette} title="Paleta Principal - Naranjas" />
      <ColorGrid colors={neutrals} title="Colores Neutrales" />

      <div className="mt-8 p-4 bg-stone-800 rounded-lg">
        <h4 className="font-medium mb-2">Uso Recomendado</h4>
        <ul className="text-sm text-stone-400 space-y-1">
          <li>
            <span className="text-orange-500">Orange 500</span> - Color primario para botones y
            enlaces
          </li>
          <li>
            <span className="text-orange-600">Orange 600</span> - Estados hover y activos
          </li>
          <li>
            <span className="text-orange-100">Orange 100</span> - Fondos sutiles y highlights
          </li>
          <li>
            <span className="text-stone-500">Stone 500</span> - Texto secundario
          </li>
          <li>
            <span className="text-stone-900">Stone 900</span> - Texto principal
          </li>
        </ul>
      </div>
    </section>
  );
}
