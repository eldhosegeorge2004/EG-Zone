import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '../lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://egzone.vercel.app';
  
  const mainPages = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/cookie',
    '/games',
    '/categories',
    '/leaderboard',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const gameRoutes = [
    '2048', 'aim', 'anglematch', 'arrowescape', 'biggerarea', 'breaker', 'bubblepop', 'chess', 'colormatch', 'connect4', 'crossword', 'fitthehole', 'flappy', 'fruitslice',
    'guessword', 'ludo', 'math', 'memory', 'minesweeper', 'mirrorlaser', 'molemash', 'pong', 'puzzle', 
    'quiz', 'racing', 'reaction', 'scramble', 'simon', 'snake', 'splash', 'stickman', 
    'subway', 'sudoku', 'swing', 'tangramfit', 'tictactoe', 'topple', 'typing', 'zip'
  ].map((game) => ({
    url: `${baseUrl}/games/${game}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...mainPages, ...gameRoutes, ...blogRoutes];
}
