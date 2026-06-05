import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    farmSize: '',
    crops: '',
    message: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.phone || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message Sent Successfully!",
      description: "Our agricultural experts will contact you within 24 hours",
    });

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      farmSize: '',
      crops: '',
      message: ''
    });
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+916268649255';
  };

  const handleExpertChat = () => {
    toast({
      title: "Chat System",
      description: "Expert chat will be available soon. Please call for immediate assistance.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            हमसे संपर्क करें
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get in touch with our agricultural experts for personalized advice and support. We're here to help you achieve better crop yields and farming success.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Your first name" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Your last name" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (in acres)</Label>
                    <Input 
                      id="farmSize" 
                      placeholder="e.g., 5 acres" 
                      value={formData.farmSize}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crops">Crops You Grow</Label>
                    <Input 
                      id="crops" 
                      placeholder="e.g., Wheat, Rice, Cotton" 
                      value={formData.crops}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your farming needs, challenges, or questions..."
                      className="min-h-32"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Button variant="agricultural" size="lg" className="w-full" type="submit">
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card className="bg-gradient-primary text-white shadow-strong">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Phone className="w-6 h-6 mr-3" />
                  Quick Contact
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Call us now for immediate assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">+91 62686 49255</p>
                  <p className="text-lg opacity-90">24/7 Farmer Support</p>
                </div>
                <Button variant="harvest" size="lg" className="w-full animate-pulse" onClick={handleCallNow}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">+91 62686 49255</p>
                    <p className="text-muted-foreground">+91 84354 29751</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">info@agroveda.com</p>
                    <p className="text-muted-foreground">support@agroveda.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">
                      Agricultural Hub, Sector 12<br />
                      Farming District, State - 123456<br />
                      India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Working Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 8:00 AM - 8:00 PM<br />
                      Sunday: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Chat */}
            <Card className="shadow-medium bg-gradient-secondary">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Ask Our Experts
                </CardTitle>
                <CardDescription className="text-foreground/80">
                  Have farming questions? Chat with our agricultural experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">
                  Get instant answers to your farming queries through our expert chat system. Our agricultural specialists are available to help with:
                </p>
                <ul className="text-sm text-foreground/80 space-y-1 mb-6">
                  <li>• Product recommendations</li>
                  <li>• Dosage and application methods</li>
                  <li>• Crop-specific solutions</li>
                  <li>• Soil health management</li>
                </ul>
                <Button variant="agricultural" size="lg" className="w-full" onClick={handleExpertChat}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Expert Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;