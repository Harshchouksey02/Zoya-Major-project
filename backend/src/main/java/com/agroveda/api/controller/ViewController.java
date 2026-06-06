package com.agroveda.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class ViewController {

    @GetMapping(value = { "/", "/{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.startsWith("/api")) {
            return "forward:/error"; // Let Spring Boot handle non-existent API endpoints
        }
        return "forward:/index.html";
    }
}
