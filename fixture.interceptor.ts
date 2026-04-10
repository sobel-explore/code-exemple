// src/testing/interceptors/fixture.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { USERS_FIXTURE } from '../fixtures/users.fixture';

const FIXTURES: Record<string, unknown> = {
  '/api/users': USERS_FIXTURE,
  // ajouter vos autres fixtures ici
};

@Injectable()
export class FixtureInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.e2e) {
      return next.handle(req); // ← mode normal, on laisse passer
    }

    const fixture = FIXTURES[req.url];
    if (fixture) {
      return of(new HttpResponse({ status: 200, body: fixture }));
    }

    return next.handle(req); // ← pas de fixture pour cette URL
  }
}
