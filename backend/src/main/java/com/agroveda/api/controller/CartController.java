package com.agroveda.api.controller;

import com.agroveda.api.model.CartItem;
import com.agroveda.api.repository.CartItemRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart_items")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        return ResponseEntity.ok(items);
    }

    // Helper request DTO
    public static class CartAddRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("product_id")
        public String product_id;
        public Integer quantity;
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartAddRequest req, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (req.product_id == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Product ID required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        int qtyToAdd = req.quantity != null ? req.quantity : 1;

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, req.product_id);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + qtyToAdd);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setId(UUID.randomUUID().toString());
            item.setUserId(userId);
            item.setProductId(req.product_id);
            item.setQuantity(qtyToAdd);
            cartItemRepository.save(item);
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Added to cart");
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // Helper request DTO for updates
    public static class CartUpdateRequest {
        public Integer quantity;
    }

    @PutMapping
    public ResponseEntity<?> updateQuantity(
            @RequestParam("product_id") String productId,
            @RequestBody CartUpdateRequest req,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(req.quantity);
            cartItemRepository.save(item);
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Quantity updated");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping
    public ResponseEntity<?> removeFromCart(
            @RequestParam(value = "product_id", required = false) String productId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        if (productId != null) {
            cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            cartItemRepository.deleteByUserId(userId);
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Removed from cart");
        return ResponseEntity.ok(res);
    }
}
