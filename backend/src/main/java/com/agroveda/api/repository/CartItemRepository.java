package com.agroveda.api.repository;

import com.agroveda.api.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByUserId(String userId);
    Optional<CartItem> findByUserIdAndProductId(String userId, String productId);
    
    @Transactional
    void deleteByUserId(String userId);
    
    @Transactional
    void deleteByUserIdAndProductId(String userId, String productId);
}
