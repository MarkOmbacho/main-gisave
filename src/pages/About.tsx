import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { getBoardMembers } from "@/data/boardMembers";
import aboutImage from "@/assets/about.jpg";

const About = () => {
  const teamMembers = getBoardMembers();

  const journeyMilestones = [
    { year: "2023", description: "Started High School mentorship programmes to inspire young girls into STEM" },
    { year: "2024", description: "Official Launch of our First STEM Cohort" },
    { year: "2024", description: "Graduation of our First Physical STEM Cohort" },
    { year: "2025", description: "Won the 2025 Presidential Innovation awards & Office Launch" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section (clean, centered, dark green) */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-2xl md:text-3xl font-normal mb-8 text-primary leading-tight" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
              We believe that literacy is freedom. It's the way to a fairer and more inclusive Africa.
            </h1>
            
            {/* About Image */}
            <div className="flex justify-center">
              <img 
                src={aboutImage} 
                alt="About Girls I Save" 
                className="max-w-2xl w-full h-auto rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Top fade line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_3fr] gap-8 items-center">
            {/* Left: About Us Title (25%) */}
            <div className="text-center md:text-right">
              <h2 className="text-4xl md:text-5xl font-normal text-primary" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                About Us
              </h2>
            </div>
            
            {/* Right: Content (75%) */}
            <div className="md:pl-8">
              <p className="text-foreground/80 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                Girls I Save is a social enterprise dedicated to empowering youth across Africa to pursue education and careers in science, technology, engineering, and mathematics (STEM). Using a sustainable mix of mentorship, skills-based training, and practical learning experiences, we help young people explore their interests, build workplace-ready skills, and connect with role models and opportunities.
              </p>
              <p className="text-foreground/80 text-lg leading-relaxed" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                We partner with schools, communities, and industry to break down barriers and create inclusive pathways for the next generation of talented youth in STEM and related industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom fade line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      {/* Journey Timeline */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-normal text-primary mb-8 text-center" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>Our Journey</h2>
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
                    <h3 className="text-2xl font-normal text-primary mb-2" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{milestone.year}</h3>
                    <p className="text-foreground/80" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{milestone.description}</p>
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
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-normal text-primary mb-8 text-center" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>Meet The Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden"
            >
              <div className="aspect-square overflow-hidden bg-primary/10">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-normal text-foreground mb-1" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{member.name}</h3>
                <p className="text-sm text-foreground/60" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
