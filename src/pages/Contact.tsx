import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get in touch with us. We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8 rounded-2xl shadow-card">
            <h2 className="text-2xl font-bold text-primary mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                <Input placeholder="Your name" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <Input type="email" placeholder="your@email.com" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Message</label>
                <Textarea
                  placeholder="Tell us what you're thinking..."
                  className="rounded-xl min-h-[150px]"
                />
              </div>
              <Button className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90">
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Get in Touch</h2>
            <Card className="p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-foreground/60">info@girlsisave.org</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Phone</h3>
                  <p className="text-foreground/60">+254 XXX XXX XXX</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Location</h3>
                  <p className="text-foreground/60">Nairobi, Kenya</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
