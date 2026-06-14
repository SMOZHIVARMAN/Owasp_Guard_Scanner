package com.owaspguard.zap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ZapStartupValidator implements ApplicationRunner {

    private final ZapClient zapClient;
    private final ZapProperties zapProperties;

    @Override
    public void run(ApplicationArguments args) {

        log.info("==== ZAP CONFIG ====");
        log.info("Host: {}", zapProperties.getHost());
        log.info("Port: {}", zapProperties.getPort());
        log.info("ApiKey: {}", zapProperties.getApiKey());

        zapClient.verifyConnection();
    }
}