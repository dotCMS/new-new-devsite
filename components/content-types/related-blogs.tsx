import { ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Config } from "@/util/config";

interface Post {
    urlTitle: string;
    title: string;
    image: string;
    teaser: string;
    readTime: string;
}

interface RelatedBlogsProps {
    widgetCodeJSON: {
        posts: Post[];
    };
}

export default function RelatedBlogs(props: RelatedBlogsProps) {
    const { widgetCodeJSON } = props;
    const { posts } = widgetCodeJSON;

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">RESOURCES</p>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Want to know more?</h2>
                </div>
                <Link
                    href="/resources"
                    className="text-[#a21caf] hover:text-[#a21caf]/90 hidden sm:inline-flex items-center gap-2"
                >
                    All Blogs
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.slice(0, 3).map((post, index) => (
                    <Card key={index} className="border border-gray-200">
                        <Link href={`${Config.CDNHost}/blog/${post.urlTitle}`} className="block">
                            <CardContent className="p-0">
                                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                                    <Image
                                        src={`${Config.CDNHost}/dA/${post.image}` || "/placeholder.svg"}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-6 space-y-4">
                                    <h3 className="font-semibold text-xl">{post.title}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2">{post.teaser}</p>
                                    <p className="text-sm text-muted-foreground">{post.readTime}</p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>

            <div className="mt-8 sm:hidden">
                <Link href="/blog" className="text-[#a21caf] hover:text-[#a21caf]/90 inline-flex items-center gap-2">
                    All Blogs
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    )
}

