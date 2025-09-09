import Link from 'next/link';
import Image from 'next/image';

type EventCardProps = {
  title: string;
  description: string;
  price: string;
  date: string;
  image: string;
  category: string;
  category2: string;
  disponibilidad: string;
  href?: string;
};
function getDisponibilidadColor(disponibilidad: string) {
  if (disponibilidad.toLowerCase().includes('agotada')) {
    return 'bg-red-600';
  }
  if (disponibilidad.toLowerCase().includes('disponible')) {
    return 'bg-green-600';
  }
}

export function EventCard({
  title,
  description,
  price,
  date,
  image,
  category,
  category2,
  disponibilidad,
  href,
}: EventCardProps) {
  return (
    <div className="border-1.5 border-orange-600 rounded-xl shadow hover:shadow-lg transition overflow-hidden bg-orange-100">
      <Image
        src={image}
        alt={title}
        width={800}
        height={320}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h2 className="text-black font-semibold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="text-gray-500 text-xs">{date}</p>
        <p className="inline-block text-white text-xs bg-teal-500 rounded-xl w-16 h-4 mt-3 px-1">
          {category}
        </p>
        <p className="inline-block text-white text-xs bg-lime-500 rounded-xl w-16 h-4 mt-3 px-1">
          {category2}
        </p>
        <p
          className={`inline-block text-white text-xs rounded-xl w-17 h-4 mt-3 px-2 ${getDisponibilidadColor(disponibilidad)}`}
        >
          {disponibilidad}
        </p>

        <Link href={href || '#'}>
          <button
            className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-orange-600 active:bg-orange-700 transition"
          >
            Comprar Entradas | Precios desde {price}
          </button>
        </Link>
      </div>
    </div>
  );
}
