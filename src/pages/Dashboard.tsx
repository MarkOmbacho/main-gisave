import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Target,
  Bell,
  GraduationCap,
  MessageSquare,
  ChevronRight,
  Trophy,
} from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut, becomeMentor } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [premium, setPremium] = useState<any>(null);
  // Add state for real data
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [isMentor, setIsMentor] = useState(false);
  const [becomingMentor, setBecomingMentor] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setProfile(data));

      // fetch backend profile to detect completeness (uses backend_user_id if present)
      const backendId = localStorage.getItem('backend_user_id');
      if (backendId) {
        fetch(`/users/${backendId}`)
          .then((res) => res.json())
          .then((data) => {
            // if missing name or bio or avatar, show a CTA (we stash it in profile)
            setProfile((p: any) => ({ ...p, backend: data }));
          })
          .catch(() => {});
        
        // Check if user is already a mentor
        fetch(`/mentors/list`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('backend_token')}` }
        })
          .then((res) => res.json())
          .then((data) => {
            const userIsMentor = data.some((m: any) => m.mentor_id === Number(backendId));
            setIsMentor(userIsMentor);
          })
          .catch(() => {});
      }

      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .then(({ data }) => setRoles(data?.map((r) => r.role) || []));

      supabase
        .from("premium_memberships")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setPremium(data));
    }
  }, [user]);

  // Fetch real data on mount
  useEffect(() => {
    if (user) {
      // Programs enrolled
      fetch(`/programs?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data || []));
      // Sessions
      fetch(`/mentors/applications?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setSessions(data || []));
      // Achievements (stub: use premium for now)
      fetch(`/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => setAchievements(data.is_premium ? ["Premium Member"] : []));
      // Recent activity (notifications)
      fetch(`/notifications/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setActivities(data || []));
      // Events (stub: use programs for now)
      fetch(`/programs?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setEvents(data || []));
      // Progress (stub: use programs for now)
      fetch(`/programs?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setProgress(data || []));
    }
  }, [user]);

  const handleBecomeMentor = async () => {
    setBecomingMentor(true);
    try {
      const result = await becomeMentor('General Mentoring', 'available');
      if (result) {
        setIsMentor(true);
        // Show success notification
      }
    } catch (e) {
      console.error('Failed to become mentor:', e);
    } finally {
      setBecomingMentor(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Replace statCards with real data
  const statCards = [
    {
      title: "Programs Enrolled",
      value: programs.length,
      change: programs.length > 0 ? `+${programs.length} this month` : "No programs yet",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Mentorship Sessions",
      value: sessions.length,
      change: sessions.length > 0 ? `Next: ${sessions[0]?.scheduled_at || "-"}` : "No sessions",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Learning Streak",
      value: `${achievements.length} days` || "0 days",
      change: achievements.length > 0 ? "Keep it up!" : "Start learning!",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Achievements",
      value: achievements.length,
      change: achievements.length > 0 ? `${achievements.length} unlocked` : "No achievements yet",
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  // Replace recentActivities with activities from notifications
  const recentActivities = activities.map((n) => ({
    title: n.title || n.message,
    time: n.created_at,
    icon: Bell,
    color: "text-primary",
  }));

  // Replace upcomingEvents with events from programs (stub)
  const upcomingEvents = events.map((e) => ({
    title: e.title,
    subtitle: e.category || "Program",
    time: e.start_time || e.created_at,
    icon: Calendar,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}! 👋</h1>
                    {profile?.backend && (!profile?.backend?.name || !profile?.backend?.bio || !profile?.backend?.profile_photo_url) && (
                      <Button onClick={() => navigate('/profile')} className="rounded-xl bg-primary text-primary-foreground">Complete your profile</Button>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Ready to continue your learning journey?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {premium?.status === "active" && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Premium Member
                </Badge>
              )}
              <Button onClick={signOut} variant="outline" className="border-primary/20 hover:bg-primary/5">
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 animate-scale-in">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-card overflow-hidden group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      {stat.title}
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Progress */}
            <Card className="border-none shadow-card bg-gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Target className="h-6 w-6 text-primary" />
                      Current Progress
                    </CardTitle>
                    <CardDescription className="mt-1">Track your learning journey</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Python Programming</span>
                    <span className="text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">3 modules remaining</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Digital Marketing</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-muted-foreground">5 modules remaining</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Leadership Skills</span>
                    <span className="text-muted-foreground">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground">Almost complete!</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Explore more opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button
                    className="h-auto py-6 flex-col items-start bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/programs")}
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Browse Programs</span>
                    <span className="text-xs opacity-90 mt-1">Discover new courses</span>
                  </Button>
                  
                  <Button
                    className="h-auto py-6 flex-col items-start bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/mentors")}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Find Mentors</span>
                    <span className="text-xs opacity-90 mt-1">Connect with experts</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex-col items-start border-2 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    onClick={() => navigate("/blog")}
                  >
                    <MessageSquare className="h-6 w-6 mb-2 text-primary" />
                    <span className="font-semibold">Read Blog</span>
                    <span className="text-xs text-muted-foreground mt-1">Latest articles</span>
                  </Button>
                  
                  {premium?.status !== "active" && (
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col items-start border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                      onClick={() => navigate("/premium")}
                    >
                      <Award className="h-6 w-6 mb-2 text-primary" />
                      <span className="font-semibold">Go Premium</span>
                      <span className="text-xs text-muted-foreground mt-1">Unlock all features</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border-none shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                    <div className={`${activity.color} bg-primary/10 p-2 rounded-lg`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 mt-2">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-none shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg border-2 border-primary/20 bg-background/50 hover:border-primary transition-colors duration-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <event.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</p>
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                  View Calendar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="border-none shadow-card bg-gradient-to-br from-primary/10 via-background to-accent/10">
              <CardHeader>
                <CardTitle className="text-xl">Profile Completion</CardTitle>
                <CardDescription>Complete your profile to unlock more features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>85% Complete</span>
                    <span className="text-muted-foreground">15% remaining</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate("/dashboard")}>
                  Complete Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Become a Mentor */}
            {!isMentor && (
              <Card className="border-none shadow-card bg-gradient-to-br from-accent/10 via-background to-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    Become a Mentor
                  </CardTitle>
                  <CardDescription>Share your expertise and help others grow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ready to guide the next generation? Join our mentor community and make an impact.
                  </p>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-white" 
                    onClick={handleBecomeMentor}
                    disabled={becomingMentor}
                  >
                    {becomingMentor ? "Setting up..." : "Become a Mentor"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
