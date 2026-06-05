package com.agroveda.api.controller;

import com.agroveda.api.model.Product;
import com.agroveda.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getAllProducts(@RequestParam(value = "id", required = false) String id) {
        if (id != null) {
            Optional<Product> prod = productRepository.findById(id);
            if (prod.isPresent()) {
                return ResponseEntity.ok(List.of(prod.get()));
            }
            return ResponseEntity.ok(List.of());
        }
        List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(products);
    }

    // Helper request DTO for creating products
    public static class ProductCreateRequest {
        public String name;
        @com.fasterxml.jackson.annotation.JsonProperty("name_hindi")
        public String name_hindi;
        public String category;
        public BigDecimal price;
        public String unit;
        public String usage;
        public String description;
        @com.fasterxml.jackson.annotation.JsonProperty("description_hindi")
        public String description_hindi;
        @com.fasterxml.jackson.annotation.JsonProperty("image_url")
        public String image_url;
        @com.fasterxml.jackson.annotation.JsonProperty("bulk_offers")
        public Object bulk_offers; // can be map/list
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductCreateRequest req) {
        String id = UUID.randomUUID().toString();
        
        Product product = new Product();
        product.setId(id);
        product.setName(req.name);
        product.setNameHindi(req.name_hindi != null ? req.name_hindi : req.name);
        product.setCategory(req.category);
        product.setPrice(req.price);
        product.setUnit(req.unit);
        product.setUsage(req.usage != null ? req.usage : "Suitable for all crops");
        product.setDescription(req.description);
        product.setDescriptionHindi(req.description_hindi != null ? req.description_hindi : req.description);
        product.setImageUrl(req.image_url != null ? req.image_url : "/placeholder.svg");
        product.setRating(new BigDecimal("4.5"));
        product.setReviews(10);

        // Serialize bulk_offers as JSON string if present
        if (req.bulk_offers != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String json = mapper.writeValueAsString(req.bulk_offers);
                product.setBulkOffers(json);
            } catch (Exception e) {
                product.setBulkOffers(null);
            }
        } else {
            product.setBulkOffers(null);
        }

        productRepository.save(product);

        // Return same structure expected by Lovable
        Map<String, Object> res = new HashMap<>();
        res.put("id", product.getId());
        res.put("name", product.getName());
        res.put("category", product.getCategory());
        res.put("price", product.getPrice());

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProduct(@RequestParam String id) {
        if (!productRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        productRepository.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Product deleted");
        return ResponseEntity.ok(res);
    }
}
