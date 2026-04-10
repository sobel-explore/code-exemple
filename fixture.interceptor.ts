import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { FIXTURE_REGISTRY } from './fixture-registry';

@Injectable()
export class FixtureInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.e2e) {
      return next.handle(req);  // ← mode normal, on laisse passer
    }

    const fixture = FIXTURE_REGISTRY[req.url];
    if (fixture) {
      return of(new HttpResponse({ status: 200, body: fixture }));
    }

    return next.handle(req);  // ← pas de fixture pour cette URL, on laisse passer
  }
}
