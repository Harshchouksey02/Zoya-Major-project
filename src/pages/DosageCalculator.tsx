import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Leaf, AlertCircle } from "lucide-react";
import { useState } from "react";

const products = [
  { id: "coconut-micronutrient", name: "Coconut Micronutrient Powder", hindi: "कोकोनट माइक्रोन्यूट्रिएंट पाउडर", dosagePerAcre: 1, unit: "kg", weight: "1kg" },
  { id: "isabion", name: "Syngenta Isabion Bio Stimulant", hindi: "सिंजेंटा इसाबियन बायो स्टिमुलेंट", dosagePerAcre: 250, unit: "ml", weight: "250ml" },
  { id: "plant-aid", name: "Multiplex Plant Aid (Root Enhancer)", hindi: "मल्टीप्लेक्स प्लांट एड (रूट एन्हेंसर)", dosagePerAcre: 100, unit: "gm", weight: "100g", totalCoverage: 1 },
  { id: "chlorocal", name: "Multiplex Chlorocal", hindi: "मल्टीप्लेक्स क्लोरोकल", dosagePerAcre: 500, unit: "gm", weight: "500g" },
  { id: "kranti", name: "Multiplex Kranti Fertilizer", hindi: "मल्टीप्लेक्स क्रांति फर्टिलाइजर", dosagePerAcre: 250, unit: "ml", weight: "250ml" },
];

const DosageCalculator = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [acres, setAcres] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculateDosage = () => {
    if (!selectedProduct || !acres) return;

    const product = products.find(p => p.id === selectedProduct);
    const acreCount = parseFloat(acres);
    
    if (!product || isNaN(acreCount)) return;

    let totalQuantity = acreCount * product.dosagePerAcre;
    let bags = 1;

    if (product.unit === "kg" || product.unit === "bag" || product.unit === "bags") {
      bags = Math.ceil(totalQuantity);
    } else {
      // For liquid/ml/grams - divide by weight to get pack count
      const packWeight = parseFloat(product.weight.replace('ml', '').replace('g', '').replace('gm', ''));
      bags = Math.ceil(totalQuantity / packWeight);
    }

    setResult({
      product: product,
      acres: acreCount,
      totalQuantity: totalQuantity,
      bags: bags,
      unit: product.unit
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Dosage Calculator
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            डोसेज कैलकुलेटर
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Calculate the exact amount of fertilizer needed for your land area with our precision dosage calculator.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Calculator Card */}
          <Card className="mb-8 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculate Product Dosage
              </CardTitle>
              <CardDescription>
                Select your product and enter your land area to get precise dosage recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product">Select Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.hindi})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acres">Land Area (in Acres / एकड़)</Label>
                <Input
                  id="acres"
                  type="number"
                  placeholder="Enter area in acres"
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>

              <Button onClick={calculateDosage} className="w-full" variant="agricultural">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Dosage
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Leaf className="w-5 h-5" />
                  Dosage Calculation Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Selected Product</Label>
                    <p className="font-semibold">{result.product.name}</p>
                    <p className="text-sm text-muted-foreground">{result.product.hindi}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Land Area</Label>
                    <p className="font-semibold">{result.acres} Acres / एकड़</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center bg-primary/10 rounded-lg p-4">
                      <p className="text-2xl font-bold text-primary">{Math.ceil(result.bags)}</p>
                      <p className="text-sm text-muted-foreground">
                        Packs Required / पैकेट की जरूरत
                      </p>
                    </div>
                    <div className="text-center bg-secondary/10 rounded-lg p-4">
                      <p className="text-2xl font-bold text-secondary">
                        {result.totalQuantity} {result.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Quantity / कुल मात्रा
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Important Note / महत्वपूर्ण सूचना
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      This is a general calculation. Please consult with our agricultural experts for soil-specific recommendations.
                      यह एक सामान्य गणना है। मिट्टी-विशिष्ट सिफारिशों के लिए कृपया हमारे कृषि विशेषज्ञों से सलाह लें।
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle>Application Tips / उपयोग की सुझाव</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Best Practices</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Apply during early morning or evening</li>
                    <li>• Ensure uniform distribution</li>
                    <li>• Water the field after application</li>
                    <li>• Follow soil test recommendations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">सर्वोत्तम प्रथाएं</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• सुबह जल्दी या शाम को डालें</li>
                    <li>• समान वितरण सुनिश्चित करें</li>
                    <li>• डालने के बाद पानी दें</li>
                    <li>• मिट्टी परीक्षण की सिफारिश का पालन करें</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DosageCalculator;