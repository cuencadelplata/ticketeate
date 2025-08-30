type EventCardProps = {
  title: string;
  description: string;
  price: string;
  image: string;
};

export default function EventCard({ title, description, price, image }: EventCardProps) {
  return (
    <div className="border rounded-xl shadow hover:shadow-lg transition overflow-hidden bg-white">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
        <p className="mt-2 font-bold text-blue-600">{price}</p>
      </div>
    </div>
  );
}
