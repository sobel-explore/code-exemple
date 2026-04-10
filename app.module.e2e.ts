// app.module.e2e.ts
@NgModule({
  imports: [AppModule],   // ← boîte noire, on n'y touche pas
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FixtureInterceptor,
      multi: true,
    },
  ],
})
export class AppModuleE2e {}
