import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin } from "lucide-react";

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

// Custom X (Twitter) Icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Custom YouTube Icon
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

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
                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/girls-i-save-africa-7574ba302/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/girls_i_save_africa?igsh=MWNtMmZpNWUyenowZg==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                
                {/* X (Twitter) */}
                <a 
                  href="https://x.com/GirlsISave" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Follow us on X"
                >
                  <XIcon className="w-6 h-6" />
                </a>
                
                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@girls_i_save_africa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Follow us on TikTok"
                >
                  <TikTokIcon className="w-6 h-6" />
                </a>
                
                {/* YouTube */}
                <a 
                  href="http://www.youtube.com/@Girls-I-Save" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Follow us on YouTube"
                >
                  <YouTubeIcon className="w-6 h-6" />
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
