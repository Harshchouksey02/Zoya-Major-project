import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import banner1 from "@/assets/farming-banner-1.jpg";
import banner2 from "@/assets/farming-banner-2.jpg";
import banner3 from "@/assets/farming-banner-3.jpg";
import banner4 from "@/assets/farming-banner-4.jpg";

const banners = [
  {
    id: 1,
    image: banner1,
    title: "Premium Agricultural Solutions",
    subtitle: "बेहतर फसल के लिए बेहतर उत्पाद",
    description: "Experience the power of AgroVeda's premium fertilizers and agricultural products for maximum crop yield.",
  },
  {
    id: 2,
    image: banner2,
    title: "Quality Fertilizers & Products",
    subtitle: "गुणवत्ता जिस पर भरोसा करें",
    description: "Trusted by thousands of farmers across India. Our products ensure healthy crops and better harvest.",
  },
  {
    id: 3,
    image: banner3,
    title: "Har Kisan Ka Saathi",
    subtitle: "हर किसान का विश्वसनीय साथी",
    description: "Join the community of successful farmers who trust AgroVeda for their agricultural needs.",
  },
  {
    id: 4,
    image: banner4,
    title: "Modern Farming Solutions",
    subtitle: "आधुनिक कृषि के लिए आधुनिक समाधान",
    description: "Innovative agricultural technology and products to revolutionize your farming experience.",
  },
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-lg shadow-strong">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? "translate-x-0" : "translate-x-full"
          } ${index < currentSlide ? "-translate-x-full" : ""}`}
        >
          <div
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${banner.image})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-6">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {banner.title}
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-secondary drop-shadow-md">
                  {banner.subtitle}
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
                  {banner.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="agricultural" 
                    size="lg" 
                    className="text-lg px-8 py-3"
                    onClick={() => navigate('/products')}
                  >
                    Explore Products
                  </Button>
                  <Button 
                    variant="harvest" 
                    size="lg" 
                    className="text-lg px-8 py-3"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-secondary scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;