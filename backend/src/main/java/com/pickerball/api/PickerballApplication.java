package com.pickerball.api;

import com.pickerball.api.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class PickerballApplication {

    public static void main(String[] args) {
        SpringApplication.run(PickerballApplication.class, args);
    }
}
