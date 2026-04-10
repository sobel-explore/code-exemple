intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  if (!environment.e2e) {
    return next.handle(req);
  }

  const fixture = FIXTURE_REGISTRY[req.url];
  if (fixture) {
    return of(new HttpResponse({
      status: fixture.status ?? 200,  // ← 200 par défaut si non défini
      body: fixture.body,
    }));
  }

  return next.handle(req);
}
