// e2e-pw/support/mock-api.ts
import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

export async function mockGet(page: Page, urlPattern: string, fixtureFile: string, status = 200) {
  const fixturePath = path.join(__dirname, '../fixtures', fixtureFile);
  const body = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  await page.route(urlPattern, route =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  );
}

export async function mockPost(page: Page, urlPattern: string, responseBody: object, status = 201) {
  await page.route(urlPattern, route =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(responseBody) })
  );
}

export async function mockError(page: Page, urlPattern: string, status = 500) {
  await page.route(urlPattern, route =>
    route.fulfill({ status, body: 'Internal Server Error' })
  );
}
