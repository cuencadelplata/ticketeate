// Ejemplo: Cómo Usar OG Metadata en Otras Rutas

// ============================================
// EJEMPLO 1: Página de Categoría
// ============================================
// app/categoria/[slug]/page.tsx

import { Metadata } from 'next';
import type { Event } from '@/types/events';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const categoryTitle = slug.replace('-', ' ').toUpperCase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com';

  return {
    title: `Eventos de ${categoryTitle} | Ticketeate`,
    description: `Descubre todos los eventos de ${categoryTitle} en Ticketeate`,
    openGraph: {
      title: `Eventos de ${categoryTitle}`,
      description: `Descubre todos los eventos de ${categoryTitle} en Ticketeate`,
      type: 'website',
      url: `${baseUrl}/categoria/${slug}`,
      images: [
        {
          url: `${baseUrl}/icon-ticketeate.png`,
          width: 1200,
          height: 630,
          alt: categoryTitle,
        },
      ],
      siteName: 'Ticketeate',
    },
  };
}

// ============================================
// EJEMPLO 2: Página de Productor
// ============================================
// app/productor/[id]/page.tsx

interface Producer {
  producerid: string;
  nombre: string;
  descripcion?: string;
  foto_perfil?: string;
}

async function getProducer(id: string): Promise<Producer | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/producers/${id}`, {
      cache: 'force-cache',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const producer = await getProducer(id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com';

  if (!producer) {
    return { title: 'Productor no encontrado' };
  }

  return {
    title: `${producer.nombre} | Ticketeate`,
    description:
      producer.descripcion ||
      `Descubre los eventos de ${producer.nombre} en Ticketeate`,
    openGraph: {
      title: producer.nombre,
      description:
        producer.descripcion ||
        `Descubre los eventos de ${producer.nombre} en Ticketeate`,
      type: 'profile',
      url: `${baseUrl}/productor/${id}`,
      images: [
        {
          url: producer.foto_perfil || `${baseUrl}/icon-ticketeate.png`,
          width: 400,
          height: 400,
          alt: producer.nombre,
        },
      ],
      siteName: 'Ticketeate',
    },
  };
}

// ============================================
// EJEMPLO 3: Página de Búsqueda
// ============================================
// app/buscar/page.tsx

export const metadata: Metadata = {
  title: 'Buscar Eventos | Ticketeate',
  description: 'Busca entre miles de eventos en Ticketeate',
  openGraph: {
    title: 'Buscar Eventos',
    description: 'Busca entre miles de eventos en Ticketeate',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com'}/buscar`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com'}/icon-ticketeate.png`,
        width: 1200,
        height: 630,
      },
    ],
    siteName: 'Ticketeate',
  },
};

// ============================================
// EJEMPLO 4: Página de Blog/Artículo
// ============================================
// app/blog/[slug]/page.tsx

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`, {
      cache: 'force-cache',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com';

  if (!post) {
    return { title: 'Artículo no encontrado' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${baseUrl}/blog/${slug}`,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: 'Ticketeate',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

// ============================================
// EJEMPLO 5: Metadata Estática Global
// ============================================
// app/layout.tsx (Ya existe, solo para referencia)

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
  description: 'La plataforma más completa para la gestión de eventos',
  keywords: [
    'eventos',
    'entradas',
    'tickets',
    'gestión de eventos',
    'plataforma de eventos',
  ],
  openGraph: {
    title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
    description: 'La plataforma más completa para la gestión de eventos',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com'}/icon-ticketeate.png`,
        width: 1200,
        height: 630,
        alt: 'Ticketeate',
      },
    ],
    siteName: 'Ticketeate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ticketeate - Crea, gestiona y vende entradas en minutos',
    description: 'La plataforma más completa para la gestión de eventos',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com'}/icon-ticketeate.png`],
  },
};

// ============================================
// BESTS PRACTICES
// ============================================

/**
 * 1. SIEMPRE usa NEXT_PUBLIC_APP_URL para URLs absolutas
 * 2. Proporciona fallbacks sensatos (imágenes, descripciones)
 * 3. Usa cache 'force-cache' para datos que no cambian frecuentemente
 * 4. Usa cache 'no-store' para datos que cambian frecuentemente
 * 5. Incluye siempre og:image (es lo más importante)
 * 6. Para artículos, usa article og:type
 * 7. Para perfiles, usa profile og:type
 * 8. Twitter Cards usan la misma información que OG
 * 9. Los metadatos se generan server-side (SSR)
 * 10. Los bots de redes sociales cachean metadatos por 24-48h
 */
