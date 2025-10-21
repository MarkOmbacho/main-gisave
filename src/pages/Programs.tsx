import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { programs } from "@/data/programs";

const Programs = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Technology", "Mentorship", "Business & Technology", "Foundation"];

  const allPrograms = programs;

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
              <ProgramCard 
                id={program.id}
                title={program.title}
                description={program.shortDescription}
                category={program.category}
              />
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
