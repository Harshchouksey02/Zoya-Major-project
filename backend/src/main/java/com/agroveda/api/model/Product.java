package com.agroveda.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_hindi", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("name_hindi")
    private String nameHindi;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String unit;

    @Column(name = "product_usage", nullable = false, columnDefinition = "TEXT")
    private String usage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "description_hindi", nullable = false, columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("description_hindi")
    private String descriptionHindi;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(nullable = false)
    private Integer reviews = 0;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("image_url")
    private String imageUrl;

    @Column(name = "bulk_offers", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("bulk_offers")
    private String bulkOffers; // String containing JSON data

    @Column(name = "created_at")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    private java.sql.Timestamp createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new java.sql.Timestamp(System.currentTimeMillis());
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameHindi() {
        return nameHindi;
    }

    public void setNameHindi(String nameHindi) {
        this.nameHindi = nameHindi;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getUsage() {
        return usage;
    }

    public void setUsage(String usage) {
        this.usage = usage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescriptionHindi() {
        return descriptionHindi;
    }

    public void setDescriptionHindi(String descriptionHindi) {
        this.descriptionHindi = descriptionHindi;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getReviews() {
        return reviews;
    }

    public void setReviews(Integer reviews) {
        this.reviews = reviews;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBulkOffers() {
        return bulkOffers;
    }

    public void setBulkOffers(String bulkOffers) {
        this.bulkOffers = bulkOffers;
    }

    public java.sql.Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.sql.Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
