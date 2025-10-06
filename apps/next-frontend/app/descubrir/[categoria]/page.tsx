import { EventsByCategory } from '@/components/events-by-category';
import { useCategories } from '@/hooks/use-categories';

interface CategoryPageProps {
  params: {
    categoria: string;
  };
}

// Función para convertir slugs a nombres de categoría
function slugToCategoryName(slug: string): string {
  const categoryMap: Record<string, string> = {
    'musica': 'Música',
    'deportes': 'Deportes',
    'conferencias': 'Conferencias',
    'teatro': 'Teatro',
    'comedia': 'Comedia',
    'arte-y-cultura': 'Arte y Cultura',
    'gastronomia': 'Gastronomía',
    'tecnologia': 'Tecnología',
  };
  
  return categoryMap[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { data: categories = [] } = useCategories();
  
  const resolvedParams = await params;
  const categorySlug = resolvedParams.categoria;
  const categoryName = slugToCategoryName(categorySlug);
  
  // Buscar la categoría por nombre
  const category = categories.find(cat => 
    cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 
    categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );

  return (
    <main className="min-h-screen">
      <EventsByCategory 
        categoryId={category?.id}
        categoryName={categoryName}
        showFilter={false}
      />
    </main>
  );
}
