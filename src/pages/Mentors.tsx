import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Mentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    const { data } = await supabase
      .from("mentors")
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq("availability", true);

    setMentors(data || []);
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    mentor.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Our Mentors
          </h1>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Connect with experienced professionals who are passionate about empowering the next generation of women in STEM
          </p>
          <Input
            type="search"
            placeholder="Search mentors by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="shadow-card hover:shadow-card-hover transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {mentor.profiles?.full_name?.[0] || "M"}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{mentor.profiles?.full_name}</CardTitle>
                    <Badge className="mt-1">{mentor.specialization}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-4">
                  {mentor.profiles?.bio || "Experienced STEM professional"}
                </p>
                {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise_areas.map((area: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button className="w-full rounded-xl">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60">No mentors found. Try adjusting your search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Mentors;
