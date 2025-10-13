import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Programs = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Foundation", "Mentorship", "Advanced", "Workshops"];

  const allPrograms = [
    {
      title: "STEM Foundations",
      description: "Introduction to Science, Technology, Engineering, and Mathematics for beginners. Build your foundational knowledge and discover your passion.",
      category: "Foundation",
    },
    {
      title: "Coding Bootcamp",
      description: "Learn programming fundamentals and web development through hands-on projects and real-world applications.",
      category: "Foundation",
    },
    {
      title: "One-on-One Mentorship",
      description: "Get paired with experienced professionals in your field of interest for personalized guidance and career advice.",
      category: "Mentorship",
    },
    {
      title: "Group Mentoring Sessions",
      description: "Join small groups led by industry experts to discuss challenges, share experiences, and grow together.",
      category: "Mentorship",
    },
    {
      title: "Advanced Robotics",
      description: "Dive deep into robotics, automation, and AI. Design, build, and program your own robotic systems.",
      category: "Advanced",
    },
    {
      title: "Data Science & Analytics",
      description: "Master data analysis, visualization, and machine learning techniques used by leading tech companies.",
      category: "Advanced",
    },
    {
      title: "Weekend STEM Labs",
      description: "Participate in exciting hands-on experiments and projects every weekend. Learn by doing!",
      category: "Workshops",
    },
    {
      title: "Innovation Challenge",
      description: "Compete in our annual innovation challenge. Solve real-world problems and showcase your creativity.",
      category: "Workshops",
    },
  ];

  const filteredPrograms = selectedCategory === "All" 
    ? allPrograms 
    : allPrograms.filter(program => program.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Programs</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Explore our offerings across programs, upcoming events, and courses designed to make STEM accessible
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-xl px-6"
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Programs Grid */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program, index) => (
            <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <ProgramCard {...program} />
            </div>
          ))}
        </div>
        {filteredPrograms.length === 0 && (
          <p className="text-center text-foreground/60 py-12">
            No programs found in this category.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
