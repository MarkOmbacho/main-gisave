import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [premium, setPremium] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Fetch user profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setProfile(data));

      // Fetch user roles
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .then(({ data }) => setRoles(data?.map((r) => r.role) || []));

      // Fetch premium status
      supabase
        .from("premium_memberships")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setPremium(data));
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Name:</strong> {profile?.full_name}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Role:</strong> {roles.join(", ")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Status:</strong> {premium?.status}</p>
                {premium?.status === "free" && (
                  <Button className="mt-4 w-full" onClick={() => navigate("/premium")}>
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate("/programs")}>
                Browse Programs
              </Button>
              <Button className="w-full" onClick={() => navigate("/mentors")}>
                Find Mentors
              </Button>
              <Button className="w-full" onClick={() => navigate("/blog")}>
                Read Blog
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
