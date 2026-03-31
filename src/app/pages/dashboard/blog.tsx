import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus, Eye, ThumbsUp } from "lucide-react";
import { mockBlogPosts, statusColors } from "../../lib/mock-data";

export function Blog() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage blog posts</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBlogPosts.map((post) => (
          <Card key={post.id}>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                  {post.status}
                </Badge>
                <span className="text-sm text-gray-500">{post.category}</span>
              </div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {post.likes}
                  </span>
                </div>
                <span>{post.publishedDate}</span>
              </div>
              <Button variant="outline" className="w-full">Edit Post</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
