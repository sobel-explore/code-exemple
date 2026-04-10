module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        include: /src\/app/,
        exclude: /\.spec\.ts$/,
        enforce: 'post',
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['istanbul'],
          },
        },
      },
    ],
  },
};

"extraWebpackConfig": "webpack.e2e.js",



  // tests/support/coverage.ts
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function collectCoverage(page: Page, testName: string) {
  const coverage = await page.evaluate(() => (window as any).__coverage__);
  if (coverage) {
    const dir = path.join('.nyc_output');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${testName}.json`),
      JSON.stringify(coverage)
    );
  }
}





// evite de le répéter dans chaque test
export default defineConfig({
  ...
  globalTeardown: './tests/support/global-teardown.ts',
});



"pretest":  "rimraf .nyc_output coverage/e2e",
"test":     "playwright test",
"posttest": "nyc report"





7. .nycrc
json{
  "extends": "@istanbuljs/nyc-config-babel",
  "reporter": ["lcov", "text-summary"],
  "report-dir": "coverage/e2e",
  "include": ["src/app/**/*.ts"],
  "exclude": ["src/testing/**", "**/*.spec.ts"],
  "all": true
}
