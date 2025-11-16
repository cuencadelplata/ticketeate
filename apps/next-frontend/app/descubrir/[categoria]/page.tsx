import { EventsByCategory } from '@/components/events-by-category';
import { useCategories } from '@/hooks/use-categories';

interface CategoryPageProps {
  params: Promise<{
    categoria: string;
  }>;
}

// Función para convertir slugs a nombres de categoría
function slugToCategoryName(slug: string): string {
  const categoryMap: Record<string, string> = {
    musica: 'Música',
    deportes: 'Deportes',
    conferencias: 'Conferencias',
    teatro: 'Teatro',
    comedia: 'Comedia',
    'arte-y-cultura': 'Arte y Cultura',
    gastronomia: 'Gastronomía',
    tecnologia: 'Tecnología',
  };

  if (categoryMap[slug]) {
    return categoryMap[slug];
  }

  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { data: categories = [] } = useCategories();

  const resolvedParams = await params;
  const categorySlug = resolvedParams.categoria;
  const categoryName = slugToCategoryName(categorySlug);

  let category = categories.find((cat) => {
    const catNameNormalized = cat.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const categoryNameNormalized = categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return catNameNormalized === categoryNameNormalized;
  });

  if (!category) {
    category = categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());
  }

  if (!category) {
    category = categories.find((cat) => {
      const catNameNoAccents = cat.name.toLowerCase().replace(/[áéíóúüñ]/g, (match) => {
        const accents: Record<string, string> = {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
          ü: 'u',
          ñ: 'n',
        };
        return accents[match] || match;
      });
      const categoryNameNoAccents = categoryName.toLowerCase().replace(/[áéíóúüñ]/g, (match) => {
        const accents: Record<string, string> = {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
          ü: 'u',
          ñ: 'n',
        };
        return accents[match] || match;
      });
      return catNameNoAccents === categoryNameNoAccents;
    });
  }

  return (
    <main className="min-h-screen">
      <EventsByCategory categoryId={category?.id} categoryName={categoryName} showFilter={false} />
    </main>
  );
}
