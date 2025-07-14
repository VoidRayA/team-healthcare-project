package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 대부분 엔티티에 @JsonIgnore 추가
// @JsonIgnore << json 직렬화/역직렬화 과정에서 특정 필드를 제외

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}