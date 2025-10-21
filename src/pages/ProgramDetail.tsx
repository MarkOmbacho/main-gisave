import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProgramById } from "@/data/programs";
import { ArrowLeft, Clock, Users, CheckCircle2 } from "lucide-react";

const ProgramDetail = () => {
  const { id } = useParams<{ id: string }>();
  const program = getProgramById(id || "");

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Program Not Found</h1>
            <p className="text-foreground/60 mb-8">The program you're looking for doesn't exist.</p>
            <Link to="/programs">
              <Button className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Link to="/programs" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Link>
            </div>
            <div className="mb-6">
              <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {program.category}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{program.title}</h1>
            <p className="text-xl opacity-90 mb-8">{program.shortDescription}</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{program.eligibility}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {/* About the Program */}
            <Card className="border-none shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">About This Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-lg leading-relaxed">
                  {program.fullDescription}
                </p>
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card className="border-none shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {program.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Program Details */}
            <Card className="border-none shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Program Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Duration</h3>
                    <p className="text-foreground/80">{program.duration}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Eligibility</h3>
                    <p className="text-foreground/80">{program.eligibility}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Category</h3>
                    <p className="text-foreground/80">{program.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Format</h3>
                    <p className="text-foreground/80">
                      {program.id.includes('virtual') ? 'Online' : 'In-Person'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Recap */}
            <div className="bg-gradient-card p-8 rounded-3xl text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">How It Went</h2>
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                This program has concluded. Below is a summary of what we achieved.
              </p>
              <ul className="flex flex-col items-start gap-3 max-w-2xl mx-auto mb-6">
                {program.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground/80">{obj}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact">
                <Button variant="outline" className="rounded-xl px-8 py-6 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramDetail;
