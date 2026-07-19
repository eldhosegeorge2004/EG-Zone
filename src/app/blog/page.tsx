import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import { BookOpen, Calendar, Clock } from "lucide-react";

export const metadata = {
  title: "Blog & Articles | EG ZONE",
  description: "Read our latest articles about web games, cognitive benefits of gaming, and development.",
};

export default function BlogIndex() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-2xl mb-6 shadow-sm">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Blog & Articles</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
          Insights, guides, and history about the world of web gaming.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center text-xs font-semibold text-indigo-600 mb-4 uppercase tracking-wider gap-4">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              
              <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 flex-grow">
                {post.excerpt}
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 font-medium text-sm text-gray-500">
                By {post.author}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
