import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useState } from "react";

const dealers = [
  {
    id: 1,
    name: "AgroVeda Jabalpur Center",
    nameHindi: "एग्रोवेदा जबलपुर केंद्र",
    address: "Opposite Bus Stand, Jabalpur, Madhya Pradesh - 482001",
    addressHindi: "बस स्टैंड के सामने, जबलपुर, मध्य प्रदेश - 482001",
    phone: "+91 98765 43210",
    distance: 0.5,
    hours: "8:00 AM - 8:00 PM",
    hoursHindi: "सुबह 8:00 - शाम 8:00",
  },
  {
    id: 2,
    name: "AgroVeda Dealer Jabalpur",
    nameHindi: "एग्रोवेदा डीलर जबलपुर",
    address: "Near Railway Station, Civil Lines, Jabalpur - 482002",
    addressHindi: "रेलवे स्टेशन के पास, सिविल लाइन्स, जबलपुर - 482002",
    phone: "+91 87654 32109",
    distance: 2.3,
    hours: "7:00 AM - 9:00 PM",
    hoursHindi: "सुबह 7:00 - शाम 9:00",
  },
  {
    id: 3,
    name: "Sihora Agri Solutions",
    nameHindi: "सिहोरा एग्री सॉल्यूशन्स",
    address: "Main Market, Sihora, Jabalpur, Madhya Pradesh - 482057",
    addressHindi: "मुख्य बाजार, सिहोरा, जबलपुर, मध्य प्रदेश - 482057",
    phone: "+91 76543 21098",
    distance: 18.5,
    hours: "8:30 AM - 7:30 PM",
    hoursHindi: "सुबह 8:30 - शाम 7:30",
  },
  {
    id: 4,
    name: "AgroVeda Sihora Branch",
    nameHindi: "एग्रोवेदा सिहोरा शाखा",
    address: "Bus Stand Road, Sihora, Jabalpur - 482057",
    addressHindi: "बस स्टैंड रोड, सिहोरा, जबलपुर - 482057",
    phone: "+91 65432 10987",
    distance: 19.2,
    hours: "9:00 AM - 6:00 PM",
    hoursHindi: "सुबह 9:00 - शाम 6:00",
  },
  {
    id: 5,
    name: "Panumariya Krishi Kendra",
    nameHindi: "पनुमरिया कृषि केंद्र",
    address: "Main Chowk, Panumariya, Katni, Madhya Pradesh - 483775",
    addressHindi: "मुख्य चौक, पनुमरिया, कटनी, मध्य प्रदेश - 483775",
    phone: "+91 54321 09876",
    distance: 45.8,
    hours: "8:00 AM - 8:00 PM",
    hoursHindi: "सुबह 8:00 - शाम 8:00",
  },
  {
    id: 6,
    name: "Modern Agro Panumariya",
    nameHindi: "मॉडर्न एग्रो पनुमरिया",
    address: "Near Government Hospital, Panumariya, Katni - 483775",
    addressHindi: "सरकारी अस्पताल के पास, पनुमरिया, कटनी - 483775",
    phone: "+91 43210 98765",
    distance: 46.5,
    hours: "7:30 AM - 7:30 PM",
    hoursHindi: "सुबह 7:30 - शाम 7:30",
  },
  {
    id: 7,
    name: "Green Valley Jabalpur",
    nameHindi: "ग्रीन वैली जबलपुर",
    address: "Adhartal Road, Jabalpur, Madhya Pradesh - 482004",
    addressHindi: "अधारताल रोड, जबलपुर, मध्य प्रदेश - 482004",
    phone: "+91 98765 12345",
    distance: 8.2,
    hours: "8:00 AM - 7:00 PM",
    hoursHindi: "सुबह 8:00 - शाम 7:00",
  },
];

const DealerLocator = () => {
  const [location, setLocation] = useState("");
  const [filteredDealers, setFilteredDealers] = useState(dealers);

  const handleSearch = () => {
    if (location.trim()) {
      const filtered = dealers.filter(dealer =>
        dealer.address.toLowerCase().includes(location.toLowerCase()) ||
        dealer.name.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredDealers(filtered);
    } else {
      setFilteredDealers(dealers);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Find Nearest Dealer
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            अपने नजदीकी डीलर खोजें
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Locate authorized AgroVeda dealers near you for authentic products and expert guidance.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Search Dealers
            </CardTitle>
            <CardDescription>
              Enter your city or area to find nearby dealers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="location">Your Location</Label>
                <Input
                  id="location"
                  placeholder="Enter city, area, or pincode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} variant="agricultural">
                  <Navigation className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="hover:shadow-strong transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{dealer.name}</CardTitle>
                <CardDescription className="font-medium">{dealer.nameHindi}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{dealer.address}</p>
                    <p className="text-sm text-muted-foreground">{dealer.addressHindi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{dealer.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{dealer.hours}</p>
                    <p className="text-sm text-muted-foreground">{dealer.hoursHindi}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-primary font-medium">
                    {dealer.distance} km away
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `tel:${dealer.phone}`}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="agricultural" 
                      size="sm"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDealers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No dealers found in your area. Please try a different location or contact us for assistance.
            </p>
            <Button variant="agricultural" className="mt-4">
              Contact Support
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-gradient-hero text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Become a Dealer</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our network of trusted dealers and grow your agricultural business with AgroVeda.
          </p>
          <Button variant="harvest" size="lg" onClick={() => window.open('https://wa.me/916268649255?text=Hi! I am interested in applying for dealership. Please provide more details.', '_blank')}>
            Apply for Dealership
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DealerLocator;