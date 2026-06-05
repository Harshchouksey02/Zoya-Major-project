// Simplified product image resolver for AgroVeda

export function getProductImage(imageUrl: string): string {
  if (!imageUrl) return "/placeholder.svg";
  
  // Check if it's already a valid URL (http/https) or local assets path
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }
  
  return "/placeholder.svg";
}

export default {};
