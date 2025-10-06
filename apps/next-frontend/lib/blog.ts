import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

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

export function getAllPosts(): BlogPost[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);

    const posts = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

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
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getAllPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => fileName.replace(/\.mdx$/, ''));
  } catch (error) {
    console.error('Error reading blog slugs:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Calcular tiempo de lectura
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
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts();

  if (category === 'todo' || !category) {
    return allPosts;
  }

  return allPosts.filter((post) => post.category === category);
}
