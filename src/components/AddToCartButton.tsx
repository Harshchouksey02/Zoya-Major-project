import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
}

export default function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const { addToCart, user } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isAdding}
      className={className}
      size="sm"
    >
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
