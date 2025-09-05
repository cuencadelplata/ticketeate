type EventCardProps = {
  title: string;
  description: string;
  price: string;
  date: string;
  image: string;
};

export function EventCard({ title, description, price, date, image }: EventCardProps) {
  return (
    <div className="border-1.5 border-orange-600 rounded-xl shadow hover:shadow-lg transition overflow-hidden bg-orange-100">
      <img src={image} alt={title} className="w-full h-48 object-cover" />

      <div className="p-4">
        <h2 className="text-black font-semibold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="text-gray-500 text-xs">{date}</p>

        {/* Botón naranja en vez del precio */}
        <button
          className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-orange-600 active:bg-orange-700 transition"
        >
          Comprar Entradas | Precios desde {price}
        </button>
      </div>
    </div>
  );
}
