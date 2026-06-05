package com.agroveda.api.controller;

import com.agroveda.api.model.Order;
import com.agroveda.api.model.OrderItem;
import com.agroveda.api.repository.CartItemRepository;
import com.agroveda.api.repository.OrderItemRepository;
import com.agroveda.api.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Value("${agroveda.jwt.secret}") // reuse jwt secret or read razorpay keys
    private String jwtSecret;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;


    // Helper request DTOs
    public static class OrderItemDTO {
        @com.fasterxml.jackson.annotation.JsonProperty("order_id")
        public String order_id;
        @com.fasterxml.jackson.annotation.JsonProperty("product_id")
        public String product_id;
        @com.fasterxml.jackson.annotation.JsonProperty("product_name")
        public String product_name;
        @com.fasterxml.jackson.annotation.JsonProperty("product_price")
        public BigDecimal product_price;
        public Integer quantity;
        @com.fasterxml.jackson.annotation.JsonProperty("total_price")
        public BigDecimal total_price;
    }

    public static class OrderCreateRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("user_id")
        public String user_id;
        @com.fasterxml.jackson.annotation.JsonProperty("customer_name")
        public String customer_name;
        @com.fasterxml.jackson.annotation.JsonProperty("customer_address")
        public String customer_address;
        @com.fasterxml.jackson.annotation.JsonProperty("customer_phone")
        public String customer_phone;
        public BigDecimal subtotal;
        @com.fasterxml.jackson.annotation.JsonProperty("discount_amount")
        public BigDecimal discount_amount;
        @com.fasterxml.jackson.annotation.JsonProperty("total_amount")
        public BigDecimal total_amount;
        @com.fasterxml.jackson.annotation.JsonProperty("payment_method")
        public String payment_method;
        public String status;
        @com.fasterxml.jackson.annotation.JsonProperty("order_number")
        public String order_number;
        @com.fasterxml.jackson.annotation.JsonProperty("razorpay_order_id")
        public String razorpay_order_id;
        @com.fasterxml.jackson.annotation.JsonProperty("razorpay_payment_id")
        public String razorpay_payment_id;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(value = "id", required = false) String id,
            @RequestParam(value = "user_id", required = false) String queryUserId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String role = (String) request.getAttribute("userRole");

        if (id != null) {
            Optional<Order> order = orderRepository.findById(id);
            if (order.isPresent()) {
                if ("admin".equalsIgnoreCase(role) || order.get().getUserId().equals(userId)) {
                    return ResponseEntity.ok(List.of(order.get()));
                } else {
                    Map<String, String> err = new HashMap<>();
                    err.put("message", "Access denied");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
                }
            }
            return ResponseEntity.ok(List.of());
        }

        List<Order> orders;
        if ("admin".equalsIgnoreCase(role)) {
            if (queryUserId != null) {
                orders = orderRepository.findByUserIdOrderByCreatedAtDesc(queryUserId);
            } else {
                orders = orderRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody OrderCreateRequest req, HttpServletRequest request) {
        try {
            System.out.println("DEBUG: placeOrder called. user_id from req=" + req.user_id + ", customer_name=" + req.customer_name);
            String userId = (String) request.getAttribute("userId");
            System.out.println("DEBUG: userId from interceptor=" + userId);

            if (req.customer_name == null || req.customer_address == null || req.customer_phone == null) {
                System.out.println("DEBUG: Missing order details check failed. customer_name=" + req.customer_name + ", customer_address=" + req.customer_address + ", customer_phone=" + req.customer_phone);
                Map<String, String> err = new HashMap<>();
                err.put("message", "Missing order details");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }

            String orderId = UUID.randomUUID().toString();
            
            // Generate unique order number (AV-YYYYMMDD-Random)
            String dateStr = new SimpleDateFormat("yyyyMMdd").format(new Date());
            int randSuffix = new Random().nextInt(9000) + 1000;
            String orderNumber = "AV-" + dateStr + "-" + randSuffix;
            
            String status = req.status != null ? req.status : 
                ("razorpay".equalsIgnoreCase(req.payment_method) ? "paid" : "pending");

            Order order = new Order();
            order.setId(orderId);
            order.setUserId(userId != null ? userId : req.user_id); // fallback to user_id from req if interceptor didn't set it (for flexibility)
            order.setOrderNumber(orderNumber);
            order.setCustomerName(req.customer_name);
            order.setCustomerAddress(req.customer_address);
            order.setCustomerPhone(req.customer_phone);
            order.setSubtotal(req.subtotal);
            order.setDiscountAmount(req.discount_amount != null ? req.discount_amount : BigDecimal.ZERO);
            order.setTotalAmount(req.total_amount);
            order.setPaymentMethod(req.payment_method);
            order.setStatus(status);
            order.setRazorpayOrderId(req.razorpay_order_id);
            order.setRazorpayPaymentId(req.razorpay_payment_id);
            
            System.out.println("DEBUG: Saving order to database: " + orderId);
            orderRepository.save(order);
            System.out.println("DEBUG: Order saved successfully.");

            // Return as array so that .select().single() in QueryBuilder works
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", orderId);
            orderMap.put("order_number", orderNumber);
            orderMap.put("status", status);
            orderMap.put("user_id", order.getUserId());
            orderMap.put("customer_name", req.customer_name);
            orderMap.put("customer_address", req.customer_address);
            orderMap.put("customer_phone", req.customer_phone);
            orderMap.put("subtotal", req.subtotal);
            orderMap.put("discount_amount", req.discount_amount);
            orderMap.put("total_amount", req.total_amount);
            orderMap.put("payment_method", req.payment_method);
            orderMap.put("razorpay_order_id", req.razorpay_order_id);
            orderMap.put("razorpay_payment_id", req.razorpay_payment_id);

            List<Map<String, Object>> result = new ArrayList<>();
            result.add(orderMap);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            System.err.println("DEBUG: Exception in placeOrder!");
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("message", "Internal Server Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // POST /api/order_items — frontend creates order items separately
    @PostMapping("/order_items")
    public ResponseEntity<?> createOrderItems(@RequestBody Object rawBody) {
        try {
            System.out.println("DEBUG: createOrderItems called. RawBody class=" + rawBody.getClass().getName());
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<OrderItemDTO> items;
            
            // Handle both single object and array
            if (rawBody instanceof List) {
                items = mapper.convertValue(rawBody, new com.fasterxml.jackson.core.type.TypeReference<List<OrderItemDTO>>() {});
            } else {
                OrderItemDTO single = mapper.convertValue(rawBody, OrderItemDTO.class);
                items = List.of(single);
            }

            System.out.println("DEBUG: Saving " + items.size() + " order items to database.");
            for (OrderItemDTO itemDto : items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setId(UUID.randomUUID().toString());
                orderItem.setOrderId(itemDto.order_id);
                orderItem.setProductId(itemDto.product_id);
                orderItem.setProductName(itemDto.product_name);
                orderItem.setProductPrice(itemDto.product_price);
                orderItem.setQuantity(itemDto.quantity);
                orderItem.setTotalPrice(itemDto.total_price);
                orderItemRepository.save(orderItem);
            }
            System.out.println("DEBUG: Order items saved successfully.");

            Map<String, String> res = new HashMap<>();
            res.put("message", "Order items created");
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            System.err.println("DEBUG: Exception in createOrderItems!");
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("message", "Failed to create order items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    public static class OrderStatusUpdate {
        public String status;
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody OrderStatusUpdate req) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Order order = optionalOrder.get();
        order.setStatus(req.status);
        orderRepository.save(order);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Order status updated");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/order_items")
    public ResponseEntity<?> getOrderItems(@RequestParam("order_id") String orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return ResponseEntity.ok(items);
    }

    // ----------------- EDGE FUNCTIONS EMULATION ENDPOINTS -----------------

    public static class RazorpayOrderRequest {
        public BigDecimal amount;
        public String currency;
        public String receipt;
    }

    @PostMapping("/functions/create-razorpay-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody RazorpayOrderRequest req) {
        String keyId = (razorpayKeyId != null && !razorpayKeyId.isEmpty()) ? razorpayKeyId : System.getenv("RAZORPAY_KEY_ID");
        String keySecret = (razorpayKeySecret != null && !razorpayKeySecret.isEmpty()) ? razorpayKeySecret : System.getenv("RAZORPAY_KEY_SECRET");

        if (keyId == null || keySecret == null || keyId.isEmpty() || keySecret.isEmpty()) {
            System.out.println("Razorpay credentials not configured. Using mock simulation.");
            Map<String, Object> res = new HashMap<>();
            res.put("order_id", "order_mock_" + System.currentTimeMillis() + "_" + (new Random().nextInt(9000) + 1000));
            res.put("amount", req.amount.multiply(new BigDecimal("100")).setScale(0, java.math.RoundingMode.HALF_UP));
            res.put("currency", req.currency != null ? req.currency : "INR");
            res.put("mock", true);
            return ResponseEntity.ok(res);
        }

        try {
            int amountInPaise = req.amount.multiply(new BigDecimal("100")).intValue();
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String auth = keyId + ":" + keySecret;
            byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + new String(encodedAuth));

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amountInPaise);
            body.put("currency", req.currency != null ? req.currency : "INR");
            body.put("receipt", req.receipt != null ? req.receipt : "receipt_" + System.currentTimeMillis());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity("https://api.razorpay.com/v1/orders", entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                Map<String, Object> order = response.getBody();
                Map<String, Object> res = new HashMap<>();
                res.put("order_id", order.get("id"));
                res.put("amount", order.get("amount"));
                res.put("currency", order.get("currency"));
                return ResponseEntity.ok(res);
            } else {
                throw new Exception("Failed to call Razorpay API");
            }
        } catch (Exception e) {
            System.err.println("Error creating Razorpay order: " + e.getMessage());
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    public static class RazorpayVerifyRequest {
        public String razorpay_order_id;
        public String razorpay_payment_id;
        public String razorpay_signature;
    }

    @PostMapping("/functions/verify-razorpay-payment")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestBody RazorpayVerifyRequest req) {
        try {
            if ("sig_mock_verified".equals(req.razorpay_signature) || 
                (req.razorpay_order_id != null && req.razorpay_order_id.startsWith("order_mock_"))) {
                System.out.println("Mock payment verified successfully: " + req.razorpay_payment_id);
                Map<String, Object> res = new HashMap<>();
                res.put("verified", true);
                return ResponseEntity.ok(res);
            }

            String keySecret = (razorpayKeySecret != null && !razorpayKeySecret.isEmpty()) ? razorpayKeySecret : System.getenv("RAZORPAY_KEY_SECRET");
            if (keySecret == null || keySecret.isEmpty()) {
                throw new Exception("Razorpay secret not configured");
            }

            String message = req.razorpay_order_id + "|" + req.razorpay_payment_id;
            
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hashBytes = sha256_HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            String expectedSignature = sb.toString();

            if (!expectedSignature.equals(req.razorpay_signature)) {
                System.err.println("Payment signature verification failed");
                Map<String, Object> res = new HashMap<>();
                res.put("verified", false);
                res.put("error", "Invalid payment signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            System.out.println("Payment verified successfully: " + req.razorpay_payment_id);
            Map<String, Object> res = new HashMap<>();
            res.put("verified", true);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            System.err.println("Error verifying payment: " + e.getMessage());
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/functions/send-order-notifications")
    public ResponseEntity<?> sendOrderNotifications() {
        System.out.println("Order notifications skipped (Twilio not configured)");
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Notifications skipped (Twilio not configured)");
        return ResponseEntity.ok(res);
    }
}
