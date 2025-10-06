'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCategories } from '@/hooks/use-categories';
import {
  Music,
  Gamepad2,
  Mic,
  Calendar,
  Heart,
  Palette,
  Briefcase,
  UtensilsCrossed,
} from 'lucide-react';

const categoryIcons = {
  1: Music, // Música
  2: Gamepad2, // Deportes
  3: Mic, // Conferencias
  4: Palette, // Teatro
  5: Heart, // Comedia
  6: Palette, // Arte y Cultura
  7: UtensilsCrossed, // Gastronomía
  8: Briefcase, // Tecnología
};

// nombres a slugs
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres tildados
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^a-z0-9-]/g, ''); // Elimina caracteres especiales
}

export function CategorySelector() {
  const { data: categories = [] } = useCategories();

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-instrument-serif text-5xl bg-gradient-to-b from-black to-stone-900 bg-clip-text text-transparent mb-2 pb-2">
            Explora por categorías
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontrá eventos que te interesen según tus gustos
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {categories.map((category, index) => {
            const IconComponent =
              categoryIcons[category.id as keyof typeof categoryIcons] || Palette;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/descubrir/${createSlug(category.name)}`}>
                  <div className="group cursor-pointer">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <IconComponent className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 text-center group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
