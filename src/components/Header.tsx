import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/agro-veda-logo.png";
import CartDrawer from "@/components/CartDrawer";
import UserMenu from "@/components/UserMenu";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={logo} alt="AgroVeda Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">AgroVeda Fertilizer pvt</h1>
              <p className="text-xs text-muted-foreground">Premium Agricultural Products</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/products") ? "text-primary" : "text-foreground"
              }`}
            >
              Products
            </Link>
            <Link
              to="/dealer-locator"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dealer-locator") ? "text-primary" : "text-foreground"
              }`}
            >
              Find Dealers
            </Link>
            <Link
              to="/dosage-calculator"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dosage-calculator") ? "text-primary" : "text-foreground"
              }`}
            >
              Calculator
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary" : "text-foreground"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2">
            <UserMenu />
            <CartDrawer />
            <Button variant="call" size="sm" className="animate-bounce hover:animate-none" onClick={() => window.location.href = 'tel:+916268649255'}>
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <CartDrawer />
            <button
              className="text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive("/") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive("/products") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/dealer-locator"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive("/dealer-locator") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Dealers
              </Link>
              <Link
                to="/dosage-calculator"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive("/dosage-calculator") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculator
              </Link>
              <Link
                to="/contact"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive("/contact") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-2 border-t border-border">
                <UserMenu />
              </div>
              <Button variant="call" size="lg" className="w-full" onClick={() => window.location.href = 'tel:+916268649255'}>
                <Phone className="w-5 h-5" />
                Call Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
