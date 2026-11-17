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
    '2048', 'aim', 'breaker', 'bubbles', 'chess', 'colormatch', 'connect4', 'cookie',
    'crossword', 'dino', 'flappy', 'fruitninja', 'geodash', 'guessword', 'invaders',
    'math', 'memory', 'minesweeper', 'mole', 'nonogram', 'platform', 'pong', 'puzzle', 
    'quiz', 'racing', 'reaction', 'scramble', 'simon', 'sliding', 'snake',
    'stack', 'stickman', 'sudoku', 'tictactoe', 'typing', 'zip'
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
