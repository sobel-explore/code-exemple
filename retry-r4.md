

```java
// Injection
private final ReactiveCircuitBreakerFactory cb;
private final RetryRegistry retryRegistry; // à injecter

public <T> Mono<T> runCircuitBreaker(Mono<T> toRun) {
    Retry retry = retryRegistry.retry("monService"); // nom dans ton yml
    
    return this.cb.run(
        toRun.transformDeferred(RetryOperator.of(retry)),
        throwable -> Mono.error(throwable)
    );
}




public <T> Mono<T> runCircuitBreaker(Mono<T> toRun) {
    Retry retry = retryRegistry.retry("monService");
    
    return this.cb.run(toRun, throwable -> Mono.error(throwable))
        .transformDeferred(RetryOperator.of(retry));
}

```
