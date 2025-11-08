'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCategories } from '@/hooks/use-categories';
import { Music, Gamepad2, Mic, Heart, Palette, Briefcase, UtensilsCrossed } from 'lucide-react';

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
    <section className="py-6 sm:py-12 bg-white dark:bg-stone-950">
      <div className="max-w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="font-instrument-serif text-4xl sm:text-4xl lg:text-5xl bg-gradient-to-b from-black to-stone-900 dark:from-white dark:to-stone-300 bg-clip-text text-transparent mb-2 pb-2">
            Explorá por categorías
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-stone-400">
            Encontrá eventos que te interesen según tus gustos
          </p>
        </motion.div>

        {/* Mobile: Slider horizontal */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 sm:gap-6 px-4 pb-2">
            {categories.map((category, index) => {
              const IconComponent =
                categoryIcons[category.id as keyof typeof categoryIcons] || Palette;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0"
                >
                  <Link href={`/descubrir/${createSlug(category.name)}`}>
                    <div className="group cursor-pointer text-center w-20">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-300 dark:border-orange-700 flex items-center justify-center transition-all duration-300 active:scale-95">
                        <IconComponent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-xs font-medium text-gray-700 dark:text-stone-300 text-center line-clamp-2 px-1">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid centrado */}
        <div className="hidden lg:block px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {categories.map((category, index) => {
              const IconComponent =
                categoryIcons[category.id as keyof typeof categoryIcons] || Palette;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/descubrir/${createSlug(category.name)}`}>
                    <div className="group cursor-pointer text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-300 dark:border-orange-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                        <IconComponent className="h-8 w-8 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-stone-300 text-center group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
