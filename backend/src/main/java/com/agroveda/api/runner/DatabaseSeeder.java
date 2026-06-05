package com.agroveda.api.runner;

import com.agroveda.api.model.Product;
import com.agroveda.api.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            System.out.println("No products found in MySQL database. Starting auto-seeding from products.json...");
            try {
                ObjectMapper mapper = new ObjectMapper();
                InputStream is = getClass().getResourceAsStream("/products.json");
                if (is == null) {
                    System.err.println("Could not find products.json in classpath resources!");
                    return;
                }

                List<Map<String, Object>> rawProducts = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> raw : rawProducts) {
                    Product p = new Product();
                    p.setId(raw.get("id") != null ? String.valueOf(raw.get("id")) : UUID.randomUUID().toString());
                    p.setName((String) raw.get("name"));
                    
                    String nameHindi = (String) raw.get("name_hindi");
                    p.setNameHindi(nameHindi != null ? nameHindi : (String) raw.get("name"));
                    
                    p.setCategory((String) raw.get("category"));
                    
                    Object priceVal = raw.get("price");
                    p.setPrice(priceVal != null ? new BigDecimal(String.valueOf(priceVal)) : BigDecimal.ZERO);
                    
                    p.setUnit((String) raw.get("unit"));
                    
                    String usage = (String) raw.get("usage");
                    p.setUsage(usage != null ? usage : "Suitable for all crops");
                    
                    p.setDescription((String) raw.get("description"));
                    
                    String descHindi = (String) raw.get("description_hindi");
                    p.setDescriptionHindi(descHindi != null ? descHindi : (String) raw.get("description"));
                    
                    Object ratingVal = raw.get("rating");
                    p.setRating(ratingVal != null ? new BigDecimal(String.valueOf(ratingVal)) : new BigDecimal("4.5"));
                    
                    Object reviewsVal = raw.get("reviews");
                    p.setReviews(reviewsVal != null ? ((Number) reviewsVal).intValue() : 10);
                    
                    p.setImageUrl((String) raw.get("image_url"));
                    
                    Object bulk = raw.get("bulk_offers");
                    if (bulk != null) {
                        p.setBulkOffers(mapper.writeValueAsString(bulk));
                    }
                    
                    productRepository.save(p);
                }
                
                System.out.println("Auto-seeding complete! Successfully seeded " + rawProducts.size() + " products.");
            } catch (Exception e) {
                System.err.println("Failed to seed database: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("MySQL database already populated with " + productRepository.count() + " products. Skipping seeding.");
        }
    }
}
