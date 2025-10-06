import { EventsByCategory } from '@/components/events-by-category';

export default function EventosPorCategoriaPage() {
  return (
    <main className="min-h-screen">
      {/* Sección principal con filtro */}
      <EventsByCategory showFilter={true} />
      
      {/* Secciones específicas por categoría */}
      <EventsByCategory 
        categoryId={1} 
        categoryName="Eventos de Música" 
        showFilter={false} 
      />
      
      <EventsByCategory 
        categoryId={2} 
        categoryName="Eventos Deportivos" 
        showFilter={false} 
      />
      
      <EventsByCategory 
        categoryId={8} 
        categoryName="Eventos de Tecnología" 
        showFilter={false} 
      />
    </main>
  );
}
