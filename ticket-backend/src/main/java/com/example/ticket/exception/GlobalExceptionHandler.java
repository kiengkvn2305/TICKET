package com.example.ticket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
        DuplicateResourceException.class
    )

    public ResponseEntity<String> handleDuplicate(
        DuplicateResourceException e
    ) {

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());

    }

}