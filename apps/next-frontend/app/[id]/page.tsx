import { notFound } from 'next/navigation';

export default async function EventoPage({ params }: { params: { id: string } }) {
  return <div>ruta dinámica eventos</div>;
}
