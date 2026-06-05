import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/productImages";
import { toast } from "sonner";

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartItems, cartCount, updateQuantity, removeFromCart, getCartTotal, user } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart ({cartCount} items)
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some products to get started!</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                >
                  <img
                    src={getProductImage(item.product.image_url)}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.product.name_hindi}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        ₹{item.product.price} / {item.product.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subtotal: ₹{item.product.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{getCartTotal()}</span>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Complete your order with Cash on Delivery
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
