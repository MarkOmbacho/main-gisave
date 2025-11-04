import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq("published", true)
      .order("published_at", { ascending: false });

    setPosts(data || []);
  };

  const filteredPosts = posts.filter((post) =>
    post.title?.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-normal text-primary mb-4" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Blog
          </h1>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Stories, insights, and inspiration from our community
          </p>
          <Input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="shadow-card hover:shadow-card-hover transition-all cursor-pointer">
              {post.thumbnail_url && (
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardHeader>
                <div className="flex gap-2 mb-2">
                  {post.category && <Badge style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{post.category}</Badge>}
                </div>
                <CardTitle className="text-xl line-clamp-2" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{post.title}</CardTitle>
                <CardDescription className="line-clamp-3" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-foreground/60">
                  <span style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>By {post.profiles?.full_name}</span>
                  {post.published_at && (
                    <span style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{formatDistanceToNow(new Date(post.published_at))} ago</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>No articles found. Check back soon!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
