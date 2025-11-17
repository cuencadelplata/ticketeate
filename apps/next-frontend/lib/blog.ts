import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
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
  category: 'guias' | 'ingenieria' | 'producto' | 'equipo';
  featured?: boolean;
}

// Post slugs
const POST_SLUGS = [
  'bienvenido-a-ticketeate',
  'casos-exito-eventos',
  'guias-para-organizar-eventos',
  'nuevas-caracteristicas-producto',
  'tecnologia-behind-ticketeate',
  'tutorial-apis-técnicas',
];

function getRawPostContent(slug: string): string {
  try {
    // Buscar el archivo en diferentes rutas posibles
    const possiblePaths = [
      path.join(process.cwd(), `content/blog/${slug}.mdx`),
      path.join(process.cwd(), `apps/next-frontend/content/blog/${slug}.mdx`),
      path.join(process.cwd(), `../content/blog/${slug}.mdx`),
    ];

    let content = '';
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf-8');
          return content;
        }
      } catch (err) {
        // Continuar con el siguiente path
      }
    }

    // Si llegamos aquí, el archivo no se encontró
    console.error(`Post ${slug} not found in any of the paths:`, possiblePaths);
    throw new Error(`Post file not found: ${slug}`);
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    throw error;
  }
}

function parsePost(slug: string, fileContents: string): BlogPost {
  const { data, content } = matter(fileContents);

  // Calcular tiempo de lectura aproximado (250 palabras por minuto)
  const wordsPerMinute = 250;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return {
    slug,
    content,
    readTime,
    title: data.title || '',
    excerpt: data.excerpt || '',
    publishedAt: data.publishedAt || data.date || new Date().toISOString(),
    updatedAt: data.updatedAt || data.date || new Date().toISOString(),
    author: data.author || 'Ticketeate Team',
    tags: data.tags || [],
    image: data.image,
    category: data.category || 'equipo',
    featured: data.featured || false,
  };
}

// Cache en memoria para los posts
let postsCache: BlogPost[] | null = null;

export async function getAllPosts(): Promise<BlogPost[]> {
  if (postsCache) {
    return postsCache;
  }

  try {
    const posts = POST_SLUGS.map((slug) => {
      try {
        const content = getRawPostContent(slug);
        return parsePost(slug, content);
      } catch (error) {
        console.error(`Error parsing post ${slug}:`, error);
        return null;
      }
    }).filter((post): post is BlogPost => post !== null);

    postsCache = posts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return postsCache;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getAllPostSlugs(): string[] {
  return POST_SLUGS;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    if (!POST_SLUGS.includes(slug)) {
      return null;
    }

    const content = getRawPostContent(slug);
    return parsePost(slug, content);
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();

  if (category === 'todo' || !category) {
    return allPosts;
  }

  return allPosts.filter((post) => post.category === category);
}
