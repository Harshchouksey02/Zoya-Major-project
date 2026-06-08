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
import { Trash2, Plus, LogOut, ShoppingBag, IndianRupee, ChevronDown, ChevronUp, RefreshCw, ClipboardList, CheckCircle, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Record<string, any[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  // Form state for adding products
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
    // Verify admin access
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Access denied. Please login.");
        navigate("/login");
        return;
      }
      
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("role", "admin");
        
      if (!roles || roles.length === 0) {
        toast.error("Admin access required.");
        navigate("/");
      }
    };
    checkAdmin();
    fetchProducts();
    fetchOrders();
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

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setIsOrdersLoading(false);
  };

  const toggleOrderExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);
    
    if (!selectedOrderItems[orderId]) {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) {
        toast.error("Failed to fetch order items");
        console.error(error);
      } else {
        setSelectedOrderItems(prev => ({
          ...prev,
          [orderId]: data || []
        }));
      }
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success("Order status updated successfully");
      fetchOrders();
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

  // Stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  const completedOrders = orders.filter(o => o.status === "paid" || o.status === "delivered").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage products, orders, and sales summary.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { fetchProducts(); fetchOrders(); }} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 py-3 px-6 rounded-md font-semibold text-sm transition-all ${
              activeTab === "products"
                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Package className="h-4 w-4" />
            Products Management
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 py-3 px-6 rounded-md font-semibold text-sm transition-all ${
              activeTab === "orders"
                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Orders & Sales Summary
            <span className="ml-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">
              {orders.length}
            </span>
          </button>
        </div>

        {activeTab === "products" && (
          <div className="grid md:grid-cols-12 gap-8">
            {/* Add Product Form */}
            <div className="md:col-span-5">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>Fill in the product details below</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
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

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Product"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Products List */}
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-500" />
                Manage Products
              </h2>
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <Card key={product.id} className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md border border-slate-100"
                          />
                          <div>
                            <h3 className="font-semibold text-slate-800">{product.name}</h3>
                            <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                              {product.category}
                            </p>
                            <p className="text-sm font-semibold text-slate-800 mt-2">
                              ₹{product.price} <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              ⭐ {product.rating} ({product.reviews} reviews)
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-8">
            {/* Orders Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Sales Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1 flex items-center">
                      ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Orders Placed</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{orders.length}</h3>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active / Pending Deliveries</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingOrders}</h3>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-full text-amber-600">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List & Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-slate-500" />
                  Order Registry & Status Monitor
                </h2>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  {completedOrders} Delivered/Paid
                </span>
              </div>

              {isOrdersLoading ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500">Loading order summary...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    const items = selectedOrderItems[order.id] || [];
                    const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });

                    // Status Badge Styling
                    let statusColor = "bg-slate-100 text-slate-800 border-slate-200";
                    if (order.status === "paid" || order.status === "delivered") {
                      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    } else if (order.status === "processing") {
                      statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                    } else if (order.status === "cancelled") {
                      statusColor = "bg-red-50 text-red-700 border-red-200";
                    } else if (order.status === "pending") {
                      statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                    }

                    return (
                      <Card key={order.id} className="shadow-sm border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Order Header Summary */}
                        <div className="bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base font-bold text-slate-800">
                                {order.order_number || `AV-ORDER-${order.id.substring(6, 12).toUpperCase()}`}
                              </span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${statusColor}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Order Placed: <span className="font-semibold text-slate-600">{orderDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end">
                            <span className="text-lg font-bold text-emerald-600">
                              ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-slate-500 capitalize">
                              Method: {order.payment_method}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="p-6 bg-slate-50/50 grid md:grid-cols-12 gap-6 text-sm">
                          <div className="md:col-span-4 space-y-2">
                            <h4 className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Customer Details</h4>
                            <p className="font-medium text-slate-800">{order.customer_name}</p>
                            <p className="text-slate-600">{order.customer_phone}</p>
                          </div>

                          <div className="md:col-span-5 space-y-2">
                            <h4 className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Shipping Address</h4>
                            <p className="text-slate-700 text-xs leading-relaxed">{order.customer_address}</p>
                          </div>

                          {/* Quick Status Control Dropdown */}
                          <div className="md:col-span-3 space-y-2">
                            <h4 className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Update Status</h4>
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleUpdateStatus(order.id, val)}
                            >
                              <SelectTrigger className="w-full bg-white border-slate-200">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Expandable Order Items Detail Drawer */}
                        {isExpanded && (
                          <div className="p-6 bg-white border-t border-slate-100">
                            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-emerald-600" />
                              Items Summary
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3 text-center">Unit Price</th>
                                    <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-slate-50/50">
                                      <td className="px-6 py-4 font-medium text-slate-800">
                                        {item.product_name}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        ₹{parseFloat(item.product_price).toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                                        {item.quantity}
                                      </td>
                                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        ₹{parseFloat(item.total_price).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Detailed Bill Calculations */}
                            <div className="mt-4 flex flex-col items-end text-sm space-y-1 pr-6 border-t border-slate-50 pt-4">
                              <div className="flex gap-12 text-slate-500">
                                <span>Subtotal:</span>
                                <span>₹{parseFloat(order.subtotal || order.total_amount).toFixed(2)}</span>
                              </div>
                              {parseFloat(order.discount_amount) > 0 && (
                                <div className="flex gap-12 text-red-500">
                                  <span>Discount:</span>
                                  <span>- ₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex gap-12 text-slate-800 font-bold text-base mt-2">
                                <span>Total Paid:</span>
                                <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Toggle expand button */}
                        <div className="bg-slate-50/20 border-t border-slate-100 flex justify-center">
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="py-2.5 w-full flex items-center justify-center gap-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all font-semibold text-xs"
                          >
                            {isExpanded ? (
                              <>
                                Hide Items
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                View Full Summary & Items
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
