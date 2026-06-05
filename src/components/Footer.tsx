import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">A</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">AgroVeda Fertilizer pvt</h3>
                <p className="text-sm opacity-90">Premium Agricultural Products</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              AgroVeda Fertilizer pvt आपका विश्वसनीय कृषि साथी है। हम उच्च गुणवत्ता वाले कृषि उत्पाद और समाधान प्रदान करते हैं जो आपकी फसल की पैदावार बढ़ाने में मदद करते हैं।
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Top Products</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Coconut Micronutrient Powder</li>
              <li>Syngenta Isabion</li>
              <li>Multiplex Plant Aid</li>
              <li>Multiplex Chlorocal</li>
              <li>Multiplex Kranti</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">+91 62686 49255</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">info@agroveda.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Agricultural Hub, India</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 pt-4">
              <Facebook className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Instagram className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Twitter className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            © 2026 AgroVeda Fertilizer pvt. All rights reserved. | Premium Agricultural Products
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;