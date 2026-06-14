package com.owaspguard.zap;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/zap")
@RequiredArgsConstructor
public class ZapController {

    private final ZapClient zapClient;

    @GetMapping("/health")
    public ResponseEntity<ZapHealthResponse> getHealth() {
        String version = zapClient.getVersion();
        if (version != null) {
            ZapHealthResponse response = ZapHealthResponse.builder()
                    .status("UP")
                    .version(version)
                    .build();
            return ResponseEntity.ok(response);
        } else {
            ZapHealthResponse response = ZapHealthResponse.builder()
                    .status("DOWN")
                    .version("unknown")
                    .build();
            // Return 200 OK containing DOWN status, indicating API itself is up but dependent ZAP daemon is down
            return ResponseEntity.ok(response);
        }
    }
}
