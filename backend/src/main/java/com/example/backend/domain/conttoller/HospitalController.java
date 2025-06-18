package com.example.backend.domain.conttoller;

import com.example.backend.domain.dto.HospitalDetailItem;
import com.example.backend.domain.service.ApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hospital")
public class HospitalController {
    private final ApiService apiService;

    public HospitalController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping("/{ykion}")
    public HospitalDetailItem getHospital(@PathVariable String ykiho){
        return apiService.getHospitalDetail(ykiho);
    }
}