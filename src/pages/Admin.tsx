import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, Plus, LogOut } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [nameHindi, setNameHindi] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [usage, setUsage] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHindi, setDescriptionHindi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState("4.5");
  const [reviews, setReviews] = useState("100");
  const [bulkOfferBuy, setBulkOfferBuy] = useState("");
  const [bulkOfferGet, setBulkOfferGet] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const bulkOffers = bulkOfferBuy && bulkOfferGet 
      ? [{ buy: parseInt(bulkOfferBuy), get: parseInt(bulkOfferGet) }]
      : null;

    const { error } = await supabase.from("products").insert({
      name,
      name_hindi: nameHindi,
      category,
      price: parseFloat(price),
      unit,
      usage,
      description,
      description_hindi: descriptionHindi,
      image_url: imageUrl,
      rating: parseFloat(rating),
      reviews: parseInt(reviews),
      bulk_offers: bulkOffers as any,
    });

    if (error) {
      toast.error("Failed to add product");
      console.error(error);
    } else {
      toast.success("Product added successfully!");
      // Reset form
      setName("");
      setNameHindi("");
      setCategory("");
      setPrice("");
      setUnit("");
      setUsage("");
      setDescription("");
      setDescriptionHindi("");
      setImageUrl("");
      setRating("4.5");
      setReviews("100");
      setBulkOfferBuy("");
      setBulkOfferGet("");
      fetchProducts();
    }
    setIsLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } else {
      toast.success("Product deleted successfully!");
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={handleLogout} variant="destructive" size="lg" className="gap-2">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
              <CardDescription>Fill in the product details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name (English)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameHindi">Product Name (Hindi)</Label>
                  <Input
                    id="nameHindi"
                    value={nameHindi}
                    onChange={(e) => setNameHindi(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insecticide">Insecticide</SelectItem>
                      <SelectItem value="Fungicide">Fungicide</SelectItem>
                      <SelectItem value="Herbicide">Herbicide</SelectItem>
                      <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                      <SelectItem value="Bio-Stimulant">Bio-Stimulant</SelectItem>
                      <SelectItem value="Plant Growth Regulator">Plant Growth Regulator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g., 500ml, 1kg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage">Usage</Label>
                  <Input
                    id="usage"
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    placeholder="e.g., For Cotton, Wheat, Vegetables"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (English)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionHindi">Description (Hindi)</Label>
                  <Textarea
                    id="descriptionHindi"
                    value={descriptionHindi}
                    onChange={(e) => setDescriptionHindi(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="e.g., /src/assets/product.jpg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviews">Reviews Count</Label>
                    <Input
                      id="reviews"
                      type="number"
                      value={reviews}
                      onChange={(e) => setReviews(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkOfferBuy">Bulk Offer (Buy)</Label>
                    <Input
                      id="bulkOfferBuy"
                      type="number"
                      value={bulkOfferBuy}
                      onChange={(e) => setBulkOfferBuy(e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkOfferGet">Bulk Offer (Get Free)</Label>
                    <Input
                      id="bulkOfferGet"
                      type="number"
                      value={bulkOfferGet}
                      onChange={(e) => setBulkOfferGet(e.target.value)}
                      placeholder="e.g., 1"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • ₹{product.price}/{product.unit}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ⭐ {product.rating} ({product.reviews} reviews)
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
