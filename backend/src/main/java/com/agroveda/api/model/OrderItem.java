package com.agroveda.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_id", nullable = false, length = 36)
    @com.fasterxml.jackson.annotation.JsonProperty("order_id")
    private String orderId;

    @Column(name = "product_id", nullable = false, length = 36)
    @com.fasterxml.jackson.annotation.JsonProperty("product_id")
    private String productId;

    @Column(name = "product_name", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("product_name")
    private String productName;

    @Column(name = "product_price", nullable = false, precision = 10, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("product_price")
    private BigDecimal productPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("total_price")
    private BigDecimal totalPrice;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
