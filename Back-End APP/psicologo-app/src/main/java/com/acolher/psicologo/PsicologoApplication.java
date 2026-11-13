package com.acolher.psicologo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PsicologoApplication {

    public static void main(String[] args) {
        SpringApplication.run(PsicologoApplication.class, args);
    }
}
