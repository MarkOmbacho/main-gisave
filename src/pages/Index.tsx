import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import ImpactStat from "@/components/ImpactStat";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import missionImage from "@/assets/mission-image.jpg";

const Index = () => {
  const programs = [
    {
      title: "Program A",
      description: "Comprehensive STEM education program focusing on building foundational skills in science and technology.",
      category: "Foundation",
    },
    {
      title: "Program B",
      description: "Advanced mentorship program connecting young women with industry professionals in STEM fields.",
      category: "Mentorship",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            BUILD, LEAD AND OWN THE FUTURE
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8">
            Empowering women through STEM Education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="rounded-xl px-8 py-6 text-lg bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/auth'}>
              Get Started
            </Button>
            <Button variant="outline" className="rounded-xl px-8 py-6 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => window.location.href = '/programs'}>
              Our Programs
            </Button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-card-hover">
            <img
              src={heroImage}
              alt="Young women learning STEM"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <img
              src={missionImage}
              alt="Girls I Save mission"
              className="rounded-3xl shadow-card w-full h-auto"
            />
          </div>
          <div className="order-1 md:order-2 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Our Mission
            </h2>
            <p className="text-foreground/80 text-lg leading-relaxed mb-6">
              We create opportunities for girls to learn, lead, and thrive by connecting them with inspiring role models, accessible learning resources, and a supportive community.
            </p>
            <Button className="rounded-xl px-8 py-6 bg-primary hover:bg-primary/90">
              Get To Know Us
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Impact
          </h2>
          <p className="text-foreground/80 text-lg max-w-3xl mx-auto">
            In partnership with like-minded organizations, we bring STEM education directly to school grounds and community centers through hands-on activities that spark early interest and confidence. By meeting girls where they are, we show them that STEM isn't just possible—it's for them.
          </p>
        </div>
        <p className="text-center text-foreground/80 mb-8 max-w-2xl mx-auto">
          Breaking the cycle of intergenerational illiteracy and disadvantage in marginalized communities across Africa.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-scale-in">
          <ImpactStat value="5000+" label="Women and girls trained" />
          <ImpactStat value="100+" label="Mentorship Sessions delivered" />
          <ImpactStat value="30+" label="Volunteer Mentors" />
        </div>
      </section>

      {/* Programs Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Programs
          </h2>
          <p className="text-foreground/80 text-lg">
            Explore our offerings across programs, upcoming events, and courses designed to make STEM accessible
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {programs.map((program, index) => (
            <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProgramCard {...program} />
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Partners
          </h2>
          <p className="text-foreground/80 text-lg max-w-3xl mx-auto mb-8">
            Literacy is one of the most challenging issues in Africa today, and requires sharing and exchanging knowledge, new ways of thinking, acting and partnering for change.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {[1, 2, 3, 4, 5].map((partner) => (
              <div key={partner} className="text-foreground/60">
                Partner {partner}
              </div>
            ))}
          </div>
          <Button variant="outline" className="rounded-xl px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Become a Partner
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
