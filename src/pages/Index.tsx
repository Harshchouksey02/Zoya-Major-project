import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerSlider from "@/components/BannerSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Leaf, 
  TrendingUp, 
  Shield, 
  Users, 
  Star, 
  Phone, 
  ArrowRight,
  Tractor,
  ShoppingCart,
  CheckCircle2,
  Award,
  Sparkles
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const featuredProducts = [
  {
    id: "coconut-micronutrient",
    name: "Multiplex Coconut Micronutrient Powder",
    nameHindi: "मल्टीप्लेक्स कोकोनट माइक्रोन्यूट्रिएंट",
    price: 205,
    weight: "1 KG",
    rating: 4.8,
    reviews: 245,
    tag: "Best Seller",
    image: "https://cdn.shopify.com/s/files/1/0673/1697/3862/files/coconut-06.png?v=1743241465",
  },
  {
    id: "isabion",
    name: "Syngenta Isabion Bio Stimulant",
    nameHindi: "सिंजेंटा इसाबियन बायो स्टिमुलेंट",
    price: 140,
    weight: "100 ML",
    rating: 4.9,
    reviews: 312,
    tag: "Highly Rated",
    image: "https://cdn.shopify.com/s/files/1/0673/1697/3862/products/isabion_4b38f885-0724-4633-93c4-058d96cee6e4.png?v=1743242020",
  },
  {
    id: "plant-aid",
    name: "Multiplex Plant Aid (Root Enhancer)",
    nameHindi: "मल्टीप्लेक्स प्लांट एड (रूट एन्हेंसर)",
    price: 180,
    weight: "100 GM",
    rating: 4.7,
    reviews: 189,
    tag: "Fast Growing",
    image: "https://cdn.shopify.com/s/files/1/0673/1697/3862/products/PlantAid_3.png?v=1743242178",
  },
];

const features = [
  {
    icon: Leaf,
    title: "100% Quality Solutions",
    titleHindi: "100% गुणवत्ता समाधान",
    description: "Eco-friendly agricultural products tested in labs to enhance soil health naturally.",
  },
  {
    icon: TrendingUp,
    title: "Maximize Crop Yields",
    titleHindi: "अधिकतम फसल उत्पादन",
    description: "Scientifically proven formulas designed to increase harvest productivity by up to 40%.",
  },
  {
    icon: Shield,
    title: "Advanced Protection",
    titleHindi: "उन्नत फसल सुरक्षा",
    description: "Strong defense mechanisms against pests, diseases, and micronutrient deficiencies.",
  },
  {
    icon: Users,
    title: "Dedicated Farm Support",
    titleHindi: "विशेषज्ञ कृषि सहायता",
    description: "Instant access to agricultural experts for customized dosage and farming advice.",
  },
];

const trustBadges = [
  { icon: Award, text: "Government Approved", subtext: "प्रमाणित उत्पाद" },
  { icon: CheckCircle2, text: "Lab Tested Formulas", subtext: "प्रयोगशाला परीक्षित" },
  { icon: Sparkles, text: "100% Organic Options", subtext: "100% जैविक विकल्प" },
];

const testimonials = [
  {
    name: "Ramesh Patel",
    location: "Anand, Gujarat",
    rating: 5,
    text: "AgroVeda ke Coconut Micronutrient ke upyog se meri nariyal ki paidawar me 35% tak ki vriddhi hui hai. Phal bade aur swasth hain.",
    textEn: "Using AgroVeda's Coconut Micronutrient increased my coconut yield by 35%. The fruits are large and healthy."
  },
  {
    name: "Sanjay Choudhary",
    location: "Indore, Madhya Pradesh",
    rating: 5,
    text: "Isabion aur AgroVeda products ne meri soya crop ko peele pan se bachaya. Greenery aur growth bahut acchi mili.",
    textEn: "Isabion and AgroVeda products saved my soybean crop from yellowing. Got excellent greening and growth."
  },
  {
    name: "Rajesh Kumar",
    location: "Karnal, Haryana",
    rating: 5,
    text: "AgroVeda root enhancers ne mitti ko naram kiya aur jhadon ko mazboot banaya. Kam paani me bhi acchi fasal hui.",
    textEn: "AgroVeda root enhancers loosened the soil and strengthened the roots. The crop thrived even with less water."
  }
];

const Index = () => {
  const { user } = useCart();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Floating Background Glow Blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-2/3 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-[120px] pointer-events-none" />

      <Header />
      
      <main className="relative z-10">
        
        {/* Modern Premium Hero Grid Section */}
        <section className="container mx-auto px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Trusted by 50,000+ Indian Farmers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.15] tracking-tight">
              Grow Healthier Crops With <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                AgroVeda Fertilizers
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary font-semibold flex items-center gap-2">
              <span className="border-b-2 border-secondary pb-1">उन्नत कृषि, समृद्ध किसान</span>
            </p>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              AgroVeda brings you scientifically formulated fertilizers, micronutrients, and crop boosters. Elevate your farming output, secure crop health, and optimize soil longevity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/products">
                <Button variant="agricultural" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-glow">
                  <Tractor className="w-5 h-5 mr-2" />
                  Shop Products
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl hover:bg-muted border-primary/30 text-primary transition-colors"
                onClick={() => window.location.href = 'tel:+916268649255'}
              >
                <Phone className="w-5 h-5 mr-2" />
                Talk to Expert
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              {trustBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-foreground leading-none">{badge.text}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium mt-1">{badge.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl filter blur-xl -z-10" />
            <div className="overflow-hidden rounded-3xl border border-border/60 shadow-strong bg-card/40 backdrop-blur-sm p-2 hover:scale-[1.01] transition-transform duration-500">
              <BannerSlider />
            </div>
          </div>
        </section>

        {/* Features Section - Glassmorphic Grid */}
        <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3.5 py-1.5 rounded-full border border-secondary/20">Why AgroVeda</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-4 mb-2">
                Designed for Better Soil & Higher Yields
              </h2>
              <p className="text-xl text-primary font-medium">
                एग्रोवेदा ही क्यों चुनें?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden bg-card/60 backdrop-blur-sm border border-border/50 shadow-soft hover:shadow-strong hover:-translate-y-2 transition-all duration-300 rounded-2xl group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground leading-snug">{feature.title}</CardTitle>
                    <CardDescription className="text-secondary font-semibold text-xs mt-1">
                      {feature.titleHindi}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section - Premium Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">Our Bestsellers</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-4 mb-2">
                Popular Agricultural Solutions
              </h2>
              <p className="text-xl text-muted-foreground mb-4">विशेष लोकप्रिय उत्पाद</p>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Explore our high-performance organic products, crop boosters and micronutrient powders highly recommended by crop experts.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredProducts.map((product, index) => (
                <Card key={index} className="overflow-hidden bg-card/60 backdrop-blur-sm border border-border/50 shadow-soft hover:shadow-strong transition-all duration-500 hover:scale-[1.02] rounded-3xl group flex flex-col justify-between">
                  <div>
                    {/* Image Header with tag */}
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-primary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase border-none shadow-md">
                          {product.tag}
                        </Badge>
                      </div>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    
                    <div className="p-6 space-y-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                        ))}
                        <span className="text-xs font-bold text-foreground ml-2">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs font-bold text-secondary">{product.nameHindi}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 space-y-4">
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Price</span>
                        <span className="text-2xl font-extrabold text-primary">₹{product.price}</span>
                      </div>
                      <Badge variant="secondary" className="px-3.5 py-1 text-xs rounded-xl font-bold bg-primary/10 border-primary/20 text-primary">
                        {product.weight} Pack
                      </Badge>
                    </div>

                    {user ? (
                      <Link to="/products" className="w-full block">
                        <Button variant="agricultural" className="w-full py-5 rounded-xl text-sm font-semibold hover:shadow-glow transition-all">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/login" className="w-full block">
                        <Button variant="agricultural" className="w-full py-5 rounded-xl text-sm font-semibold transition-all">
                          Order Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/products">
                <Button variant="harvest" size="lg" className="px-8 py-6 rounded-xl hover:scale-105 transition-transform">
                  View All Products Catalog
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section - Clean Modern Accent */}
        <section className="py-16 bg-gradient-primary text-white relative overflow-hidden shadow-strong">
          <div className="absolute inset-0 bg-[radial-gradient(hsla(0,0%,100%,0.05)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-black tracking-tight">50,000+</div>
                <div className="text-sm md:text-base font-bold opacity-90">Happy Farmers</div>
                <div className="text-xs opacity-75">संतुष्ट किसान परिवार</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-black tracking-tight">30+</div>
                <div className="text-sm md:text-base font-bold opacity-90">Premium Products</div>
                <div className="text-xs opacity-75">उच्च गुणवत्ता वाले उत्पाद</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-black tracking-tight">15+</div>
                <div className="text-sm md:text-base font-bold opacity-90">States Reached</div>
                <div className="text-xs opacity-75">विभिन्न राज्यों में सेवा</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-black tracking-tight">24/7</div>
                <div className="text-sm md:text-base font-bold opacity-90">Expert Support</div>
                <div className="text-xs opacity-75">विशेषज्ञ सहायता परामर्श</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Styled Carousel Cards */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3.5 py-1.5 rounded-full border border-secondary/20">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-4 mb-2">
                What Farmers Say About Us
              </h2>
              <p className="text-xl text-primary font-medium">किसान अनुभव और प्रशंसा</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-sm border border-border/50 shadow-soft rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground leading-none">{testimonial.name}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-primary mt-1.5">{testimonial.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-foreground text-sm font-medium leading-relaxed mb-3">"{testimonial.text}"</p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">{testimonial.textEn}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Interactive Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-light text-primary-foreground relative overflow-hidden shadow-strong">
          <div className="absolute inset-0 bg-[radial-gradient(hsla(0,0%,100%,0.04)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Ready to Maximize Your Harvest?
            </h2>
            <p className="text-xl font-bold text-secondary mb-3">
              क्या आप अपनी फसल की पैदावार बढ़ाने के लिए तैयार हैं?
            </p>
            <p className="text-base md:text-lg mb-8 opacity-85 leading-relaxed max-w-3xl mx-auto">
              Join thousands of successful farmers who trust AgroVeda Fertilizer pvt. Get instant consultation with our farming specialists and get premium products delivered directly to your farm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="harvest" 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all shadow-md"
                onClick={() => window.location.href = 'tel:+916268649255'}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Farming Specialist
              </Button>
              <Link to="/products" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border border-white/20 hover:scale-105 transition-all">
                  <Tractor className="w-5 h-5 mr-2" />
                  Browse Products Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;