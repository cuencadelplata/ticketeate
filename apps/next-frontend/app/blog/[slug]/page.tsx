import React from 'react';
import Link from 'next/link';
import { User, Clock, ArrowLeft } from 'lucide-react';
import '@/app/blog/styles.css';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';

interface BlogPostPageProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    publishedAt: string;
    updatedAt: string;
    author: string;
    tags: string[];
    image?: string;
    readTime?: number;
  };
}

function BlogPostHeader({ post }: { post: BlogPostPageProps['post'] }) {
  return (
    <header className="max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link href="/blog" className="inline-flex items-center text-stone-400 text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al blog
        </Link>
      </nav>

      <div className="text-center">
        <div className="text-stone-400 text-xs mb-6">
          {new Date(post.publishedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        <h1 className="text-7xl font-instrument-serif font-light bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent mb-2 pb-2 leading-tight">
          {post.title}
        </h1>

        <p className="text-md text-stone-400 mb-8 leading-relaxed">{post.excerpt}</p>

        <div className="flex items-center justify-center space-x-2 text-stone-400 mb-12">
          <User className="h-4 w-4" />
          <span>{post.author}</span>
          {post.readTime && (
            <>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min de lectura</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function BlogPostContent({ content }: { content: string }) {
  return (
    <article className="max-w-3xl mx-auto px-12">
      <div
        className="blog-content prose prose-lg"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/^# (.+)$/gm, '<h2>$1</h2>') // Convertir h1 a h2 para evitar duplicado
            .replace(/^## (.+)$/gm, '<h3>$1</h3>') // Convertir h2 a h3
            .replace(/^### (.+)$/gm, '<h4>$1</h4>') // Convertir h3 a h4
            .replace(/^#### (.+)$/gm, '<h5>$1</h5>') // Convertir h4 a h5
            .replace(/^##### (.+)$/gm, '<h6>$1</h6>') // Convertir h5 a h6
            .replace(/^###### (.+)$/gm, '<p><strong>$1</strong></p>') // Convertir h6 a p con strong
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^\+ (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/m, '<ul>$1</ul>')
            .replace(/-(?=\s)/g, '<hr>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
            .replace(/<p><ul/g, '<ul')
            .replace(/<\/ul><\/p>/g, '</ul>')
            .replace(/<p><li/g, '<li')
            .replace(/<\/li><\/p>/g, '</li>'),
        }}
      />
    </article>
  );
}

function AuthorBio({ author }: { author: string }) {
  return (
    <div className="max-w-4xl mx-auto text-center mt-16 pt-8 border-t border-stone-800">
      <div className="flex items-center justify-center space-x-4">
        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center text-xl font-bold">
          {author.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{author}</h3>
          <p className="text-stone-400">Miembro del equipo Ticketeate</p>
        </div>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post no encontrado</h1>
          <Link href="/blog" className="text-orange-400 hover:text-orange-300">
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <BlogPostHeader post={post} />
        <BlogPostContent content={post.content} />
        <AuthorBio author={post.author} />
      </div>
    </div>
  );
}

// rutas estaticas
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}
