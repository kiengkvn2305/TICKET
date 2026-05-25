package com.example.ticket.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL /uploads/** → thư mục thực trên máy
        // Nhờ đó ảnh QR truy cập được qua http://localhost:8080/uploads/qr_xxx.jpg
        String location = "file:" + Paths.get(uploadDir).toAbsolutePath().normalize() + "/";
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(location);
    }
}