/* eslint-disable */
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

interface GameCardProps {
  title: string;
  description: string;
  slug: string;
  category: string;
  icon?: ReactNode; // Keeping for backwards compatibility but won't use it
  image?: string;
  color: string; 
}

export default function GameCard({ title, description, slug, category, image, color }: GameCardProps) {
  return (
    <Link href={`/games/${slug}`} className="group relative block rounded-2xl bg-white border border-gray-100 hover:bg-gray-50/50 transition-all duration-300 overflow-hidden hover:border-gray-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-3xl rounded-full group-hover:opacity-15 transition-opacity duration-500 z-0`} />
      
      {/* Thumbnail Section */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
        {image ? (
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${color} opacity-20`} />
        )}
        <div className="absolute top-4 right-4 z-10">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-gray-900 shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="relative z-10 flex flex-col flex-grow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-grow">{description}</p>
        
        <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
          Play Now
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
