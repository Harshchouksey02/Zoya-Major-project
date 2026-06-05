package com.agroveda.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    @com.fasterxml.jackson.annotation.JsonProperty("user_id")
    private String userId;

    @Column(name = "order_number", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonProperty("order_number")
    private String orderNumber;

    @Column(name = "customer_name", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("customer_name")
    private String customerName;

    @Column(name = "customer_address", nullable = false, columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("customer_address")
    private String customerAddress;

    @Column(name = "customer_phone", nullable = false, length = 20)
    @com.fasterxml.jackson.annotation.JsonProperty("customer_phone")
    private String customerPhone;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @Column(name = "payment_method", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("payment_method")
    private String paymentMethod = "cod"; // "cod", "razorpay"

    @Column(nullable = false)
    private String status = "pending"; // "pending", "paid", "delivered", "cancelled"

    @Column(name = "razorpay_order_id")
    @com.fasterxml.jackson.annotation.JsonProperty("razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    @com.fasterxml.jackson.annotation.JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "created_at")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    private Timestamp createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
