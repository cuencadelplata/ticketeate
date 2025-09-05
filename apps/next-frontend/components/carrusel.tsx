'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const featured = [
  {
    title: "El unipersonal de Luciano Mellera",
    image: "https://www.movistararena.com.ar/static/artistas/BDFE1_LucianoMellera_FileFotoFichaDesktop",
  },

  {
    title: "Bad Bunny",
    image: "https://cdn.getcrowder.com/images/684a0192-87ec-4128-94f6-1d9d173f43fd-89b883b8-7baf-442b-8e4f-92be24cc3ba8-banner-inicio-1920-x-720-3-min.jpg?w=1920&format=webp",
  },
   {
    title: "Andrea Bocelli",
    image: "https://cdn.getcrowder.com/images/0f7890b4-edaf-410c-8e70-392d445d526a-andreabocelli-hsi-banneraa-1920x720-min.jpg?w=1920&format=webp",
  },
  {
    title: "Guns N' Roses",
    image: "https://cdn.getcrowder.com/images/2c298c07-dac1-4232-8080-704fac5256bb-gunsnroses-bannersaa-nuevafecha1920x720.jpg",
  },
];
export default function carrusel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 4000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const event = featured[index];

  return (
     <div className="w-full relative overflow-hidden rounded-xl shadow-lg mb-0">
        <style>{` 
        carousel-indicators,
        .dots,
  ul[role="tablist"] {
    display: none !important;
  }
`}</style>

  <Image
    src={event.image}
    alt={event.title}
    layout="responsive"
    width={1920}
    height={720}
    className="transition duration-1000 ease-in-out rounded-xl"
  />
  <div className="absolute bottom-6 left-6 bg-black/60 text-white px-6 py-3 rounded text-2xl font-bold">
    {event.title}
  </div>
</div>

  );
} 