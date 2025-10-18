import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Bell,
  Calendar,
  DollarSign,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  ChevronRight,
  Trophy,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats from backend endpoint (to be implemented)
    fetch("/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.users || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Mentors",
      value: stats.mentors || 0,
      icon: UserCheck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Programs",
      value: stats.programs || 0,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Moderation",
      value: stats.pendingModeration || 0,
      icon: ShieldCheck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Payments",
      value: stats.payments || 0,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Achievements",
      value: stats.achievements || 0,
      icon: Trophy,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                Platform metrics and moderation tools
              </p>
            </div>
            <Button onClick={() => navigate("/admin/logout")} variant="outline" className="border-primary/20 hover:bg-primary/5">
              Sign Out
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 animate-scale-in">
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
            </Card>
          ))}
        </div>
        {/* Add moderation queue, recent activity, and quick admin actions here */}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
