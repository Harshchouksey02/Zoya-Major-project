import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Download, 
  Home,
  Printer,
  Loader2
} from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        navigate("/");
        return;
      }

      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. You will receive a confirmation via WhatsApp and SMS.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Invoice Card */}
          <Card className="mb-6 print:shadow-none" ref={invoiceRef}>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">INVOICE</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    KRISHIDHAAN BIOCARE
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {order.status.toUpperCase()}
                  </Badge>
                  <p className="font-mono text-lg font-bold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {order.customer_phone}
                    </p>
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{order.customer_address}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Payment Method:</span>{" "}
                      <span className="font-medium">Cash on Delivery</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Items:</span>{" "}
                      <span className="font-medium">{orderItems.length} products</span>
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Product</th>
                        <th className="text-center p-3 text-sm font-medium">Qty</th>
                        <th className="text-right p-3 text-sm font-medium">Price</th>
                        <th className="text-right p-3 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? "" : "bg-muted/20"}>
                          <td className="p-3 text-sm">{item.product_name}</td>
                          <td className="p-3 text-sm text-center">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">₹{item.product_price}</td>
                          <td className="p-3 text-sm text-right font-medium">
                            ₹{item.total_price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm">
                <p className="text-muted-foreground">
                  Thank you for shopping with KRISHIDHAAN BIOCARE!
                </p>
                <p className="text-muted-foreground">
                  For any queries, contact us at: +91 6268649255
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root > div > main,
          #root > div > main * {
            visibility: visible;
          }
          #root > div > main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
