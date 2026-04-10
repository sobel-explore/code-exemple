import { test as base, expect } from '@playwright/test';
import { collectCoverage } from './coverage';

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);
    await collectCoverage(page, testInfo.testId);
  },
});

export { expect };
