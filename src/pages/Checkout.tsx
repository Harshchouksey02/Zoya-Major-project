import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getProductImage } from "@/lib/productImages";
import { ShoppingBag, User, MapPin, Phone, CreditCard, Loader2, ArrowLeft, Wallet, Smartphone } from "lucide-react";
import { z } from "zod";

const RAZORPAY_KEY_ID = "rzp_live_SWjZWFEeGgzAOi";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  customerAddress: z.string().trim().min(10, "Please enter a complete address").max(500, "Address is too long"),
  customerPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, user } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getCartTotal();
  const discountPercent = subtotal >= 5000 ? 10 : subtotal >= 2000 ? 5 : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalAmount = subtotal - discountAmount;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      checkoutSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const createOrderInDB = async (payMethod: string, razorpayOrderId?: string, razorpayPaymentId?: string) => {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        customer_name: formData.customerName,
        customer_address: formData.customerAddress,
        customer_phone: formData.customerPhone,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        payment_method: payMethod,
        status: payMethod === "razorpay" ? "paid" : "pending",
        order_number: "TEMP",
        razorpay_order_id: razorpayOrderId || null,
        razorpay_payment_id: razorpayPaymentId || null,
      } as any)
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items" as any)
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Send notifications
    try {
      await supabase.functions.invoke("send-order-notifications", {
        body: {
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          totalAmount,
          items: orderItems,
          paymentMethod: payMethod,
        },
      });
    } catch (notifError) {
      console.error("Failed to send notifications:", notifError);
    }

    await clearCart();
    navigate(`/order-confirmation/${order.id}`);
    toast.success("Order placed successfully!");
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: totalAmount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
        },
      });

      if (error || !data?.order_id) {
        throw new Error(data?.error || "Failed to create payment order");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "KRISHIDHAAN BIOCARE",
        description: "Product Purchase",
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError || !verifyData?.verified) {
              throw new Error("Payment verification failed");
            }

            await createOrderInDB("razorpay", response.razorpay_order_id, response.razorpay_payment_id);
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("Payment verification failed. Please contact support.");
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.customerName,
          contact: formData.customerPhone,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      if (paymentMethod === "razorpay") {
        await handleRazorpayPayment();
      } else {
        await createOrderInDB("cod");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart to proceed with checkout.
            </p>
            <Button onClick={() => navigate("/products")}>Browse Products</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    className={errors.customerName ? "border-destructive" : ""}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className={errors.customerPhone ? "border-destructive" : ""}
                    maxLength={10}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-destructive">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="customerAddress"
                    placeholder="Enter complete delivery address with landmark"
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                    className={errors.customerAddress ? "border-destructive" : ""}
                    rows={4}
                  />
                  {errors.customerAddress && (
                    <p className="text-sm text-destructive">{errors.customerAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* COD Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all text-left ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "cod" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "cod" && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-sm text-muted-foreground">
                      Pay when your order is delivered
                    </p>
                  </div>
                </button>

                {/* Online Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all text-left ${
                    paymentMethod === "razorpay"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "razorpay" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "razorpay" && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Pay Online</p>
                    <p className="text-sm text-muted-foreground">
                      UPI, Debit/Credit Card, Net Banking, Wallets
                    </p>
                  </div>
                </button>

                {paymentMethod === "razorpay" && (
                  <div className="bg-accent/50 p-3 rounded-lg text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">
                      🔒 Secure payment powered by Razorpay. Supports GPay, PhonePe, Paytm, UPI, all cards & net banking.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={getProductImage(item.product.image_url)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.product.name_hindi}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">
                          ₹{item.product.price} × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-2">
                        Discount
                        <Badge variant="secondary">{discountPercent}% OFF</Badge>
                      </span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span className="text-sm">
                      {paymentMethod === "razorpay" ? "Pay Online" : "Cash on Delivery"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Payable</span>
                  <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>

                {discountPercent === 0 && subtotal < 2000 && (
                  <div className="bg-accent/50 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      💡 Add ₹{(2000 - subtotal).toFixed(0)} more to get 5% discount!
                    </p>
                  </div>
                )}

                {discountPercent === 5 && subtotal < 5000 && (
                  <div className="bg-accent/50 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      💡 Add ₹{(5000 - subtotal).toFixed(0)} more to get 10% discount!
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {paymentMethod === "razorpay" ? "Processing Payment..." : "Placing Order..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "razorpay" ? "Pay Now" : "Place Order"} - ₹{totalAmount.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
