package com.owaspguard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "scanTaskExecutor")
    public Executor scanTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ZapScan-Worker-");
        
        // Use AbortPolicy to throw RejectedExecutionException on request thread when queue is full
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        
        executor.initialize();
        return executor;
    }
}
