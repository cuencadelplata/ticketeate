import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Imágenes de las categorías del modal
const eventImages = {
  teatro: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838344/08_qbpkv0.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838343/07_qve3fa.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838343/06_kig1y0.avif',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/03_wlferm.jpg',
  ],
  musica: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/01_tr9xyl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/03_fkagvt.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/02_hzzfpk.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/05_tjtrsc.jpg',
  ],
  fiesta: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=500&h=500&fit=crop',
  ],
  tecnologia: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/07_hoapm8.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/04_fvc0im.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838340/08_r42uoq.jpg',
  ],
  destacado: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838351/01_k5fyfl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/02_c1hjhl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/03_v69k6f.jpg',
  ],
  retro: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838338/08_z7uqvr.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838337/10_d3b08s.jpg',
  ],
};

const eventos = [
  {
    titulo: 'Concierto de Rock en Vivo - The Rolling Covers',
    descripcion:
      "Una noche inolvidable con los mejores covers de rock clásico. Desde Led Zeppelin hasta Guns N' Roses, reviviremos los éxitos que marcaron generaciones. Incluye bar y food trucks.",
    ubicacion: 'Estadio Luna Park, Buenos Aires',
    categorias: [1], // Música
    imagenes: eventImages.musica.slice(0, 3),
    fechas: [
      {
        fecha_hora: new Date('2025-12-15T20:00:00Z'),
        fecha_fin: new Date('2025-12-15T23:30:00Z'),
      },
    ],
    stock: [
      { nombre: 'General', precio: 15000, cant_max: 500, moneda: 'ARS' },
      { nombre: 'VIP', precio: 35000, cant_max: 100, moneda: 'ARS' },
      { nombre: 'Meet & Greet', precio: 75000, cant_max: 20, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Festival de Jazz & Blues 2025',
    descripcion:
      'El festival más esperado del año con artistas internacionales de jazz y blues. Dos días de música en vivo con lo mejor del género. Incluye camping y zona gastronómica.',
    ubicacion: 'Parque Centenario, CABA',
    categorias: [1], // Música
    imagenes: eventImages.musica.slice(1, 4),
    fechas: [
      {
        fecha_hora: new Date('2025-11-20T16:00:00Z'),
        fecha_fin: new Date('2025-11-22T02:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Pase General 2 días', precio: 25000, cant_max: 1000, moneda: 'ARS' },
      { nombre: 'Pase VIP 2 días', precio: 50000, cant_max: 200, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Obra de Teatro: "El Sueño de una Noche de Verano"',
    descripcion:
      'La clásica comedia de Shakespeare cobra vida en una puesta en escena moderna y vibrante. Dirigida por María Fernández con un elenco de primer nivel.',
    ubicacion: 'Teatro Colón, Buenos Aires',
    categorias: [4], // Teatro
    imagenes: eventImages.teatro.slice(0, 2),
    fechas: [
      {
        fecha_hora: new Date('2025-11-25T19:00:00Z'),
        fecha_fin: new Date('2025-11-25T21:30:00Z'),
      },
      {
        fecha_hora: new Date('2025-11-26T19:00:00Z'),
        fecha_fin: new Date('2025-11-26T21:30:00Z'),
      },
    ],
    stock: [
      { nombre: 'Platea', precio: 12000, cant_max: 150, moneda: 'ARS' },
      { nombre: 'Palco', precio: 25000, cant_max: 40, moneda: 'ARS' },
      { nombre: 'Cazuela', precio: 8000, cant_max: 80, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Tech Summit Argentina 2025',
    descripcion:
      'La conferencia de tecnología más grande de Latinoamérica. Charlas sobre IA, blockchain, desarrollo web y más. Con speakers internacionales y networking.',
    ubicacion: 'Centro de Convenciones Buenos Aires',
    categorias: [8, 3], // Tecnología y Conferencias
    imagenes: eventImages.tecnologia,
    fechas: [
      {
        fecha_hora: new Date('2025-12-05T09:00:00Z'),
        fecha_fin: new Date('2025-12-07T18:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Pase 3 días', precio: 45000, cant_max: 800, moneda: 'ARS' },
      { nombre: 'Pase VIP 3 días + Workshop', precio: 85000, cant_max: 100, moneda: 'ARS' },
      { nombre: 'Entrada Día Individual', precio: 18000, cant_max: 300, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Stand-Up Comedy Night con Martín Bossi',
    descripcion:
      'Una noche llena de risas con uno de los comediantes más queridos de Argentina. Show especial de fin de año con invitados sorpresa.',
    ubicacion: 'Teatro Broadway, Buenos Aires',
    categorias: [5], // Comedia
    imagenes: eventImages.destacado.slice(0, 2),
    fechas: [
      {
        fecha_hora: new Date('2025-12-20T21:00:00Z'),
        fecha_fin: new Date('2025-12-20T23:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'General', precio: 18000, cant_max: 400, moneda: 'ARS' },
      { nombre: 'Premium', precio: 28000, cant_max: 100, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Fiesta Electrónica: Neon Nights',
    descripcion:
      'La mejor fiesta electrónica del verano con DJs internacionales. Música EDM, house y techno toda la noche. Decoración con luces neón y efectos visuales impresionantes.',
    ubicacion: 'Club Niceto, Palermo',
    categorias: [1], // Música
    imagenes: eventImages.fiesta,
    fechas: [
      {
        fecha_hora: new Date('2025-12-28T23:00:00Z'),
        fecha_fin: new Date('2025-12-29T06:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Early Bird', precio: 12000, cant_max: 200, moneda: 'ARS' },
      { nombre: 'General', precio: 18000, cant_max: 300, moneda: 'ARS' },
      { nombre: 'VIP con barra libre', precio: 45000, cant_max: 50, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Exposición de Arte Contemporáneo: "Visiones del Futuro"',
    descripcion:
      'Muestra colectiva de artistas emergentes argentinos. Instalaciones, pinturas y esculturas que exploran la relación entre tecnología y humanidad.',
    ubicacion: 'MALBA - Museo de Arte Latinoamericano',
    categorias: [6], // Arte y Cultura
    imagenes: eventImages.destacado.slice(1, 3),
    fechas: [
      {
        fecha_hora: new Date('2025-11-15T10:00:00Z'),
        fecha_fin: new Date('2026-01-15T20:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Entrada General', precio: 5000, cant_max: 100, moneda: 'ARS' },
      { nombre: 'Entrada Estudiantes', precio: 2500, cant_max: 50, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Festival Gastronómico: Sabores del Mundo',
    descripcion:
      'Un recorrido por la gastronomía internacional con food trucks, talleres de cocina y degustaciones. Cocina italiana, japonesa, mexicana, peruana y más.',
    ubicacion: 'Costanera Norte, Buenos Aires',
    categorias: [7], // Gastronomía
    imagenes: eventImages.destacado.slice(2, 4),
    fechas: [
      {
        fecha_hora: new Date('2025-11-30T12:00:00Z'),
        fecha_fin: new Date('2025-12-01T22:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Entrada + 5 Tickets de Comida', precio: 8000, cant_max: 500, moneda: 'ARS' },
      { nombre: 'Pase VIP + Tickets Ilimitados', precio: 20000, cant_max: 100, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Noche Retro 80s & 90s',
    descripcion:
      'Viajemos en el tiempo a las mejores décadas de la música. Hits que marcaron generación con DJ en vivo. Concursos, disfraces y premios para los mejores outfits.',
    ubicacion: 'Club de La Ciudad, CABA',
    categorias: [1], // Música
    imagenes: eventImages.retro,
    fechas: [
      {
        fecha_hora: new Date('2025-12-10T22:00:00Z'),
        fecha_fin: new Date('2025-12-11T04:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Entrada General', precio: 10000, cant_max: 400, moneda: 'ARS' },
      { nombre: 'Mesa Reservada (4 personas)', precio: 50000, cant_max: 20, moneda: 'ARS' },
    ],
  },
  {
    titulo: 'Maratón de Buenos Aires 2025',
    descripcion:
      'La carrera más importante del año en la ciudad. Recorrido de 42K por los lugares más emblemáticos de Buenos Aires. Incluye kit del corredor y medalla finisher.',
    ubicacion: 'Obelisco - Punto de Partida, Buenos Aires',
    categorias: [2], // Deportes
    imagenes: eventImages.destacado.slice(0, 2),
    fechas: [
      {
        fecha_hora: new Date('2025-11-10T07:00:00Z'),
        fecha_fin: new Date('2025-11-10T14:00:00Z'),
      },
    ],
    stock: [
      { nombre: 'Inscripción 42K', precio: 15000, cant_max: 3000, moneda: 'ARS' },
      { nombre: 'Inscripción 21K', precio: 10000, cant_max: 2000, moneda: 'ARS' },
      { nombre: 'Inscripción 10K', precio: 6000, cant_max: 1500, moneda: 'ARS' },
    ],
  },
];

async function getOrCreateUser(): Promise<string> {
  // Intentar encontrar un usuario existente con rol ORGANIZADOR
  const existingUser = await prisma.user.findFirst({
    where: {
      role: 'ORGANIZADOR',
    },
  });

  if (existingUser) {
    return existingUser.id;
  }

  // Si no existe, crear un usuario de prueba
  const userId = randomUUID();

  await prisma.user.create({
    data: {
      id: userId,
      email: 'organizer@ticketeate.com',
      name: 'Event Organizer',
      emailVerified: true,
      role: 'ORGANIZADOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return userId;
}

async function seedEvents() {
  const userId = await getOrCreateUser();

  for (const evento of eventos) {
    const eventId = randomUUID();

    // Crear el evento
    await prisma.eventos.create({
      data: {
        eventoid: eventId,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        fecha_creacion: new Date(),
        fecha_publicacion: new Date(),
        creadorid: userId,
        updated_by: userId,
        mapa_evento: {
          lat: -34.6037,
          lng: -58.3816,
          zoom: 15,
        },
        fecha_cambio: new Date(),
        views: Math.floor(Math.random() * 1000),
      },
    });

    // Crear las categorías del evento
    for (const categoriaId of evento.categorias) {
      await prisma.evento_categorias.create({
        data: {
          eventoid: eventId,
          categoriaeventoid: categoriaId,
        },
      });
    }

    // Crear las imágenes del evento
    for (let i = 0; i < evento.imagenes.length; i++) {
      await prisma.imagenes_evento.create({
        data: {
          imagenid: randomUUID(),
          eventoid: eventId,
          url: evento.imagenes[i],
          tipo: i === 0 ? 'PORTADA' : 'GALERIA',
        },
      });
    }

    // Crear las fechas del evento
    for (const fecha of evento.fechas) {
      await prisma.fechas_evento.create({
        data: {
          fechaid: randomUUID(),
          eventoid: eventId,
          fecha_hora: fecha.fecha_hora,
          fecha_fin: fecha.fecha_fin,
        },
      });
    }

    // Crear el stock de entradas
    for (const stock of evento.stock) {
      await prisma.stock_entrada.create({
        data: {
          stockid: randomUUID(),
          eventoid: eventId,
          nombre: stock.nombre,
          precio: BigInt(stock.precio),
          cant_max: stock.cant_max,
          moneda: stock.moneda,
          fecha_creacion: new Date(),
        },
      });
    }

    // Crear el estado del evento
    await prisma.evento_estado.create({
      data: {
        stateventid: randomUUID(),
        eventoid: eventId,
        Estado: 'ACTIVO',
        fecha_de_cambio: new Date(),
        usuarioid: userId,
      },
    });

    // Crear estadísticas iniciales
    await prisma.estadisticas.create({
      data: {
        estadisticaid: randomUUID(),
        eventoid: eventId,
        total_vendidos: Math.floor(Math.random() * 50),
        total_cancelados: 0,
        total_ingresos: 0,
        ultima_actualizacion: new Date(),
      },
    });
  }
}

async function main() {
  try {
    await seedEvents();
  } finally {
    await prisma.$disconnect();
  }
}

main();
