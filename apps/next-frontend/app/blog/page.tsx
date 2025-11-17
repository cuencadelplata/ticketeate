import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, BlogPost } from '@/lib/blog';

const categories = [
  { id: 'todo', label: 'Todo', key: null },
  { id: 'guias', label: 'Guías', key: 'guias' as const },
  { id: 'ingenieria', label: 'Ingeniería', key: 'ingenieria' as const },
  { id: 'producto', label: 'Producto', key: 'producto' as const },
  { id: 'equipo', label: 'Equipo', key: 'equipo' as const },
];

function CategoryFilter({ posts, activeCategory }: { posts: BlogPost[]; activeCategory?: string }) {
  return (
    <div className="flex flex-wrap gap-3 mb-12">
      {categories.map((category) => {
        const filteredPosts = category.key
          ? posts.filter((post) => post.category === category.key)
          : posts;

        return (
          <Link
            key={category.id}
            href={category.key ? `/blog?category=${category.key}` : '/blog'}
            className={`px-4 py-2 text-sm font-medium bg-black text-white ${
              activeCategory === category.key
                ? 'border-b border-orange-500'
                : 'border-b border-transparent'
            }`}
          >
            {category.label} ({filteredPosts.length})
          </Link>
        );
      })}
    </div>
  );
}

function PostColumn({ post }: { post: BlogPost }) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'guias':
        return 'Guías';
      case 'ingenieria':
        return 'Ingeniería';
      case 'producto':
        return 'Producto';
      case 'equipo':
        return 'Equipo';
      default:
        return '';
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'guias':
        return 'text-blue-400';
      case 'ingenieria':
        return 'text-purple-400';
      case 'producto':
        return 'text-green-400';
      case 'equipo':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <div className="space-y-3">
        {/* Imagen */}
        {post.image && (
          <div className="relative h-48 lg:h-56 rounded-lg overflow-hidden bg-stone-900">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
            {/* Badge de categoría */}
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-medium ${getCategoryColors(post.category)}`}>
                {getCategoryLabel(post.category)}
              </span>
            </div>
          </div>
        )}

        {/* Datos del post debajo de la imagen */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white leading-tight">{post.title}</h3>

          <div className="flex items-center space-x-4 text-sm text-stone-400">
            <span>{post.author}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const posts = await getAllPosts();
  const resolvedSearchParams = await searchParams;
  const filteredPosts = resolvedSearchParams.category
    ? posts.filter((post) => post.category === resolvedSearchParams.category)
    : posts;

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-instrument-serif font-light bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent mb-3 pb-2">
            Blog
          </h1>
        </div>

        {/* Category Filter */}
        <CategoryFilter posts={posts} activeCategory={resolvedSearchParams.category} />

        {/* Latest Publications Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Últimas publicaciones</h2>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPosts.map((post) => (
                <PostColumn key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center text-stone-400 py-16">
              <p>No se encontraron publicaciones para esta categoría.</p>
            </div>
          )}
        </section>

        {/* Newsletter Signup */}
        <div className="mt-24 border-t border-stone-800 pt-16">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Únete a nuestra comunidad</h2>
            <p className="text-stone-400 mb-8">
              Recibe los últimos artículos, consejos y actualizaciones directamente en tu inbox.
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 bg-transparent border border-stone-800 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-stone-500"
              />
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg">Suscribirse</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
