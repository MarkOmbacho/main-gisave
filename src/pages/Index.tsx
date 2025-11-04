import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import ImpactStat from "@/components/ImpactStat";
import { Button } from "@/components/ui/button";
import missionImage from "@/assets/mission-image.jpg";
import globeImage from "@/assets/GISAVE1.png";
import logoImage from "@/assets/logo.png";
import { getFeaturedPrograms } from "@/data/programs";
import PartnersMarquee from "@/components/PartnersMarquee";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Index = () => {
  const programs = getFeaturedPrograms();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Navigation logic for bottom nav
  const isActive = (path: string) => location.pathname === path;
  
  const isDropdownActive = () => {
    return location.pathname === "/about" || location.pathname === "/programs";
  };

  const allNavItems = [
    { label: "Home", path: "/" },
    { 
      label: "What we do", 
      hasDropdown: true,
      dropdownItems: [
        { label: "About Us", path: "/about" },
        { label: "Programs", path: "/programs" }
      ]
    },
    { label: "Connect", path: "/mentors" },
    { label: "Blogs", path: "/blog" },
    { label: "Contact", path: "/contact" },
  ];

  const navItems = allNavItems.map(item => {
    if (item.hasDropdown) {
      const filteredDropdownItems = item.dropdownItems?.filter(dropdownItem => 
        !isActive(dropdownItem.path)
      );
      
      if (filteredDropdownItems?.length === 1) {
        return {
          label: filteredDropdownItems[0].label,
          path: filteredDropdownItems[0].path
        };
      }
      
      if (filteredDropdownItems?.length === 0) {
        return null;
      }
      
      return {
        ...item,
        dropdownItems: filteredDropdownItems
      };
    }
    
    if (item.path && isActive(item.path)) {
      return null;
    }
    
    return item;
  }).filter((item): item is any => item !== null);

  const handleDropdownEnter = () => {
    if (dropdownTimer) clearTimeout(dropdownTimer);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
    setDropdownTimer(timer);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Revolutionary Hero Section */}
      <section className="h-[85vh] grid grid-rows-[auto_1fr] relative overflow-hidden bg-gradient-to-br from-background to-secondary/30">
        
        {/* Top Row: Logo and Auth */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 pt-1 pb-2 z-20 mt-2 sm:mt-4 gap-3 sm:gap-0">
          {/* Logo - Top Left */}
          <div className="animate-fade-in">
            <Link to="/" className="flex items-center">
              <img 
                src={logoImage} 
                alt="GISAVE Logo" 
                className="h-16 sm:h-20 md:h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Auth Buttons - Top Right */}
          <div className="animate-fade-in">
            {user ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 border border-white/20">
                <Link to="/dashboard">
                  <Button size="sm" className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-6 text-xs sm:text-sm">
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="rounded-2xl border-primary/30 hover:bg-primary/10 px-3 sm:px-6 text-xs sm:text-sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 border border-white/20">
                <Link to="/auth">
                  <Button size="sm" variant="outline" className="rounded-2xl border-primary/30 hover:bg-primary/10 px-3 sm:px-6 text-xs sm:text-sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-6 text-xs sm:text-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Middle Row: Content - Optimized Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_2fr] items-center px-4 sm:px-8 gap-4 relative z-10 -mt-8 sm:-mt-12 md:-mt-16">
          {/* Left Side: GISAVE Title */}
          <div className="animate-scale-in flex justify-center md:justify-end md:pr-4 order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-normal text-primary leading-none text-center md:text-right" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
              GISAVE
            </h1>
          </div>

          {/* Center: Globe Image - Bigger */}
          <div className="animate-fade-in flex justify-center order-1 md:order-2">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] opacity-70 hover:opacity-90 transition-opacity duration-500">
              <img 
                src={globeImage} 
                alt="GISAVE Globe with STEM Elements" 
                className="w-full h-full object-contain animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {/* Right Side: Tagline */}
          <div className="animate-fade-in flex flex-col justify-center md:justify-start md:pl-4 order-3">
            <h2 className="text-base sm:text-lg md:text-2xl font-normal text-primary leading-tight text-center md:text-left" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
              Empowering the next generation<br />through <span className="text-accent">STEM</span>.
            </h2>
          </div>
        </div>


      </section>

      {/* Spacer for Navigation */}
      <div className="h-20"></div>

      {/* Sticky Navigation for Scroll */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-2 w-full max-w-none sm:max-w-fit">
        <nav className="bg-primary backdrop-blur-md rounded-full p-2 sm:p-4 border border-primary/30 shadow-2xl mx-auto max-w-[calc(100vw-1rem)] sm:max-w-none overflow-hidden">
          <div className="flex items-center justify-center gap-1 sm:gap-3 lg:gap-6 flex-wrap sm:flex-nowrap">
            {navItems.map((item, index) => (
              <div key={index} className="relative flex-shrink-0">
                {item.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      className={`flex items-center gap-1 text-background hover:text-accent transition-colors font-normal px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${
                        isDropdownActive() ? "text-accent bg-background/20" : ""
                      }`}
                      style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                      <ChevronDown size={12} className={`sm:w-4 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div 
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-36 sm:w-48 bg-background/95 backdrop-blur-md rounded-2xl shadow-lg border border-primary/30 py-2 z-50"
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            to={dropdownItem.path}
                            className={`block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary transition-colors ${
                              isActive(dropdownItem.path) ? "text-primary bg-primary/10" : "text-primary/80"
                            }`}
                            style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={`text-background hover:text-accent transition-colors font-normal px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${
                      item.path && isActive(item.path) ? "text-accent bg-background/20" : ""
                    }`}
                    style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}
                  >
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Mission Section */}
      <section className="container mx-auto px-4 pt-8 pb-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-1 animate-fade-in md:pl-8">
            <h2 className="text-3xl md:text-4xl font-normal text-primary mb-6" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
              Our Mission
            </h2>
            <p className="text-foreground/80 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
              We create opportunities for youth to learn, lead, and thrive by connecting them with inspiring role models, accessible learning resources, and a supportive community.
            </p>
            <Button className="rounded-xl px-8 py-6 bg-primary hover:bg-primary/90" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }} onClick={() => window.location.href = '/about'}>
              Get To Know Us
            </Button>
          </div>
          <div className="order-2 md:order-2 animate-fade-in">
            <img
              src={missionImage}
              alt="Girls I Save mission"
              className="rounded-3xl shadow-card w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-background to-secondary/30 rounded-3xl my-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-primary mb-4" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Ready to Connect?
          </h2>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Get access to a mentor to walk that journey with you. Join our supportive community of learners and change-makers.
          </p>
        </div>
        
        <div className="max-w-md mx-auto animate-scale-in">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-card-hover transition-all duration-300 hover:scale-105">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-primary mb-3" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                Find Your Mentor
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                Connect with experienced professionals who understand your journey and are passionate about helping you succeed in STEM.
              </p>
              <Link to="/mentors">
                <Button className="w-full rounded-2xl px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-normal shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
                  Connect Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-primary mb-4" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Our Impact
          </h2>
          <p className="text-foreground/80 text-lg max-w-3xl mx-auto" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            In partnership with like-minded organizations, we bring STEM education directly to school grounds and community centers through hands-on activities that spark early interest and confidence. By meeting the youth where they are, we show them that STEM isn't just possible—it's for them.
          </p>
        </div>
        <p className="text-center text-foreground/80 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
          Breaking the cycle of intergenerational illiteracy and disadvantage in marginalized communities across Africa.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-scale-in">
          <ImpactStat value="5000+" label="Women and girls trained" />
          <ImpactStat value="100+" label="Mentorship Sessions delivered" />
          <ImpactStat value="30+" label="Volunteer Mentors" />
        </div>
      </section>

      {/* Programs Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-primary mb-4" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Our Programs
          </h2>
          <p className="text-foreground/80 text-lg" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Explore our offerings across programs, upcoming events, and courses designed to make STEM accessible
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {programs.map((program, index) => (
            <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProgramCard 
                id={program.id}
                title={program.title}
                description={program.shortDescription}
                category={program.category}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-normal text-primary mb-4" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Our Partners
          </h2>
          <p className="text-foreground/80 text-lg max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Literacy is one of the most challenging issues in Africa today, and requires sharing and exchanging knowledge, new ways of thinking, acting and partnering for change.
          </p>
          <div className="mb-8">
            {/* Partners logos marquee */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <PartnersMarquee />
          </div>
          <Button variant="outline" className="rounded-xl px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground" style={{ fontFamily: 'Sniglet, cursive', fontWeight: 400 }}>
            Become a Partner
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
