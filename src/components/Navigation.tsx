import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DropdownItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path?: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const { user, signOut } = useAuth();

  // Handle dropdown open/close with delay
  const handleDropdownEnter = () => {
    if (dropdownTimer) clearTimeout(dropdownTimer);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150); // Small delay to allow moving to dropdown
    setDropdownTimer(timer);
  };

  // Define helper functions first
  const isActive = (path: string) => location.pathname === path;
  
  // Check if any dropdown item is active
  const isDropdownActive = () => {
    return location.pathname === "/about" || location.pathname === "/programs";
  };

  // All possible navigation items
  const allNavItems: NavItem[] = [
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

  // Dynamic navigation - filter based on current page
  const navItems: NavItem[] = allNavItems.map(item => {
    if (item.hasDropdown) {
      // For dropdown items, filter out current page from dropdown
      const filteredDropdownItems = item.dropdownItems?.filter(dropdownItem => 
        !isActive(dropdownItem.path)
      );
      
      // If we're on one of the dropdown pages, show the other dropdown item as direct link
      if (filteredDropdownItems?.length === 1) {
        return {
          label: filteredDropdownItems[0].label,
          path: filteredDropdownItems[0].path
        };
      }
      
      // If both dropdown items should be hidden, don't show this nav item
      if (filteredDropdownItems?.length === 0) {
        return null;
      }
      
      // Show dropdown with filtered items
      return {
        ...item,
        dropdownItems: filteredDropdownItems
      };
    }
    
    // For regular items, hide if it's the current page
    if (item.path && isActive(item.path)) {
      return null;
    }
    
    return item;
  }).filter((item): item is NavItem => item !== null);

  return (
    <nav className="relative bg-transparent border-none shadow-none">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            GISAVE.
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-8">
              {navItems.map((item, index) => (
                <div key={index} className="relative">
                  {item.hasDropdown ? (
                    <div
                      className="relative group"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <button
                        className={`flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium ${
                          isDropdownActive() ? "text-primary" : ""
                        }`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {item.label}
                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div 
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleDropdownLeave}
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.path}
                              to={dropdownItem.path}
                              className={`block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors ${
                                isActive(dropdownItem.path) ? "text-primary bg-gray-50" : "text-foreground"
                              }`}
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
                      className={`text-foreground hover:text-primary transition-colors font-medium ${
                        item.path && isActive(item.path) ? "text-primary" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auth Buttons - Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button size="sm" variant="outline" className="rounded-xl">Dashboard</Button>
                </Link>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={signOut}>Sign Out</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button size="sm" variant="outline" className="rounded-xl">Login</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-xl">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.hasDropdown ? (
                  <div>
                    <div className="py-2 text-foreground font-medium border-b border-gray-200">
                      {item.label}
                    </div>
                    {item.dropdownItems.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.path}
                        to={dropdownItem.path}
                        className={`block py-2 pl-4 text-foreground hover:text-primary transition-colors ${
                          isActive(dropdownItem.path) ? "text-primary font-medium" : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={`block py-2 text-foreground hover:text-primary transition-colors ${
                      item.path && isActive(item.path) ? "text-primary font-medium" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/dashboard">
                    <Button size="sm" variant="outline" className="rounded-xl w-full">Dashboard</Button>
                  </Link>
                  <Button size="sm" variant="outline" className="rounded-xl w-full" onClick={signOut}>Sign Out</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="rounded-xl w-full">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="rounded-xl w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
