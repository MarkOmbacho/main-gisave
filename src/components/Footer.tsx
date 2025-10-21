import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Newsletter</h3>
          <p className="mb-6 opacity-90">
            Get news of what we are supporting and more by subscribing to our newsletter
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground text-foreground border-primary-foreground w-full"
                />
                <Button variant="secondary" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs mt-3 opacity-75 text-left">
                By subscribing, you agree to Girls I Save Privacy policy
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links and Socials */}
        <div className="border-t border-primary-foreground/20 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Who we are */}
            <div>
              <h4 className="font-bold text-lg mb-2">Who we are</h4>
              <div className="flex flex-col gap-1 text-sm opacity-90">
                <Link to="/about" className="hover:text-primary-foreground transition-colors">
                  Our Mission
                </Link>
                <Link to="/about" className="hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
                <Link to="/about" className="hover:text-primary-foreground transition-colors">
                  Our Team
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-2">Quick Links</h4>
              <div className="flex flex-col gap-1 text-sm opacity-90">
                <Link to="/" className="hover:text-primary-foreground transition-colors">
                  Home
                </Link>
                <Link to="/programs" className="hover:text-primary-foreground transition-colors">
                  Programs
                </Link>
                <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-bold text-lg mb-2">Follow Us</h4>
              <div className="flex items-center gap-4">
                {/* Replace hrefs with real social links */}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm opacity-90 hover:text-primary-foreground">
                  Facebook
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm opacity-90 hover:text-primary-foreground">
                  Twitter
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm opacity-90 hover:text-primary-foreground">
                  Instagram
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm opacity-90 hover:text-primary-foreground">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm opacity-75">
            © Girls I Save | 2025. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
