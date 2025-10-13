import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Premium = () => {
  const benefits = [
    "Direct messaging with mentors",
    "Book one-on-one mentorship sessions",
    "Early access to new programs",
    "Exclusive webinars and workshops",
    "Priority support",
    "Access to premium resources"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Premium Membership
          </h1>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
            Unlock exclusive features and accelerate your STEM journey
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Premium Plan</CardTitle>
            <CardDescription className="text-2xl font-bold text-primary mt-2">
              Contact for Pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <Button className="w-full rounded-xl py-6 text-lg">
              Contact Us to Upgrade
            </Button>
            <p className="text-center text-sm text-foreground/60">
              Questions? Reach out to our team for more information
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Premium;
