import { BLOG_POSTS } from "@/lib/blog";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | EG ZONE Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Link>

      <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              {post.readTime}
            </span>
          </div>
        </header>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10"></div>

        <div 
          className="prose prose-lg max-w-none prose-indigo prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
