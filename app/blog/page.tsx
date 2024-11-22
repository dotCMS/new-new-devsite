"use client";

import { useEffect, useState } from 'react';
import { dotcms } from '@/lib/dotcms';
import { format } from 'date-fns';

interface BlogPost {
  title: string;
  urlTitle: string;
  publishDate: string;
  description: string;
  image: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await dotcms.contentType('Blog')
          .query()
          .sortBy('publishDate', 'desc')
          .limit(10)
          .fetch();

        setPosts(response.items);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <article
            key={index}
            className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            {post.image && (
              <div className="relative aspect-video">
                <img
                  src={`${process.env.NEXT_PUBLIC_DOTCMS_HOST}/dA/${post.image}/400w/20q`}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-sm text-muted-foreground mb-2">
                {format(new Date(post.publishDate), 'MMMM d, yyyy')}
              </div>
              <h2 className="text-xl font-semibold mb-2 flex-1">
                <a
                  href={`/blog/${post.urlTitle}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </a>
              </h2>
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {post.description}
              </p>
              <a
                href={`/blog/${post.urlTitle}`}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Read more →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}