import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Leaf, Shield, Beaker, Package, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/AddToCartButton";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { getProductImage } from "@/lib/productImages";

type Product = Tables<"products">;

const categoryIcons: Record<string, any> = {
  Insecticide: Shield,
  Fungicide: Beaker,
  "Bio-stimulant": TrendingUp,
  "Bio-fertilizer": Leaf,
  Fertilizer: Package,
  Pesticide: Shield,
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Premium Agricultural Products
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            प्रीमियम कृषि उत्पाद
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Scientifically formulated solutions for enhanced crop yield and soil health
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:justify-center gap-2 bg-card/50 backdrop-blur-sm p-2 rounded-2xl">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Package;
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 z-10"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="aspect-square overflow-hidden bg-secondary/10">
                    <img
                      src={getProductImage(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{product.name_hindi}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {product.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {product.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                        <span className="text-sm text-muted-foreground">{product.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>Usage: {product.usage}</span>
                      </div>
                    </div>

                    {product.bulk_offers && Array.isArray(product.bulk_offers) && product.bulk_offers.length > 0 && (
                      <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                        <p className="text-sm font-semibold text-primary">🎁 Bulk Offers:</p>
                        {(product.bulk_offers as Array<{ buy: number; get: number }>).map((offer, idx) => (
                          <p key={idx} className="text-xs text-foreground">
                            Buy {offer.buy}, Get {offer.get} FREE
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {product.description_hindi}
                    </p>

                    {/* Add to Cart Button */}
                    <div className="pt-2">
                      <AddToCartButton productId={product.id} className="w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">No products found in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
