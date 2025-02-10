"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from "@/util/utils";

const TagCloud = (tags) => {
    const searchParams = useSearchParams();
    const currentTag = searchParams.get('tagFilter');

    const maxFrequency = Math.max(...tags.tags.map(tag => tag.doc_count));

    // Calculate size classes based on frequency
    const getTagSize = (frequency, maxFrequency) => {
        const ratio = frequency / maxFrequency;
        
        if (ratio > 0.8) return 'text-lg font-semibold';
        if (ratio > 0.6) return 'text-base font-medium';
        if (ratio > 0.4) return 'text-sm';
        return 'text-xs';
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
                {tags.tags.map((tag) => {
                    const isActive = currentTag === tag.key;
                    
                    return (
                        <Link
                            key={tag.key}
                            href={isActive ? '?' : `?tagFilter=${encodeURIComponent(tag.key)}`}
                            className={cn(
                                getTagSize(tag.doc_count, maxFrequency),
                                "inline-flex items-center px-3 py-1 rounded-full transition-colors",
                                isActive 
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tag.key}
                            <span className="ml-1 text-xs opacity-60">
                                ({tag.doc_count})
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default TagCloud; 