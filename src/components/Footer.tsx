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
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-primary-foreground text-foreground border-primary-foreground"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              Subscribe
            </Button>
          </div>
          <p className="text-xs mt-3 opacity-75">
            By subscribing, you agree to Girls I Save Privacy policy
          </p>
        </div>

        {/* Footer Links */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-lg mb-2">Who we are</h4>
              <div className="flex flex-col gap-1 text-sm opacity-90">
                <Link to="/about" className="hover:opacity-100 transition-opacity">
                  Our Mission
                </Link>
                <Link to="/about" className="hover:opacity-100 transition-opacity">
                  About Us
                </Link>
                <Link to="/about" className="hover:opacity-100 transition-opacity">
                  Our Team
                </Link>
              </div>
            </div>
            
            <div className="text-center text-sm opacity-75">
              ©Girls I Save | 2025. All rights reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
