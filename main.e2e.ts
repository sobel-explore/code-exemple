import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModuleE2e } from './app/app.module.e2e';

platformBrowserDynamic()
  .bootstrapModule(AppModuleE2e)
  .catch(err => console.error(err));
