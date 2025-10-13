import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const About = () => {
  const teamMembers = [
    { name: "Team Member 1", role: "Founder & CEO" },
    { name: "Team Member 2", role: "Program Director" },
    { name: "Team Member 3", role: "Community Manager" },
    { name: "Team Member 4", role: "STEM Coordinator" },
  ];

  const journeyMilestones = [
    { year: "2022", description: "Girls I Save was founded with a vision to empower young women in STEM across Africa" },
    { year: "2023", description: "Launched our first mentorship program, connecting 100+ girls with industry professionals" },
    { year: "2024", description: "Expanded to 5 countries, reaching over 1000 participants through workshops and events" },
    { year: "2025", description: "Introducing advanced programs and building partnerships with tech companies" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We believe that literacy is freedom. It's the way to a fairer and more inclusive Africa.
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">About Us</h2>
          <Card className="p-8 bg-card rounded-2xl shadow-card">
            <p className="text-foreground/80 text-lg leading-relaxed mb-4">
              Girls I Save is a non-profit organization dedicated to empowering girls and young women to pursue careers in science, technology, engineering, and mathematics (STEM). Through a supportive mix of mentorship, accessible education, and personalized career guidance, we help girls explore their interests, build practical skills, and connect with role models who reflect their dreams.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed">
              We are committed to breaking down barriers and creating pathways for the next generation of women leaders in STEM fields across Africa.
            </p>
          </Card>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-primary mb-12 text-center">Our Journey</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
            
            {journeyMilestones.map((milestone, index) => (
              <div
                key={index}
                className={`mb-12 flex items-center ${
                  index % 2 === 0 ? "flex-row-reverse" : ""
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? "pl-8" : "pr-8"}`}>
                  <Card className="p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all">
                    <h3 className="text-2xl font-bold text-primary mb-2">{milestone.year}</h3>
                    <p className="text-foreground/80">{milestone.description}</p>
                  </Card>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full border-4 border-background absolute left-1/2 transform -translate-x-1/2 z-10"></div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-primary mb-12 text-center">Meet The Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all text-center"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-4"></div>
              <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-foreground/60">{member.role}</p>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
