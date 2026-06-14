package com.owaspguard.zap;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "zap")
@Getter
@Setter
public class ZapProperties {
    private String host = "localhost";
    private int port = 8081;
    private String apiKey;
}
