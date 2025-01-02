import { createI18nFixture } from 'playwright-i18next-fixture';
import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

// Determine the language based on the ENVIRONMENT variable
const environment = process.env.ENVIRONMENT || 'DEV'; // Default to 'DEV'
const language = environment === 'STG' || environment === 'PRD' ? 'de' : 'en';

// Define file paths for the language files
const langFilePath = path.resolve(currentDir, `../../frontend/apps/sales/src/assets/i18n/${language}.json`);
const oryLangFilePath = path.resolve(currentDir, `../../frontend/apps/sales/src/assets/i18n/ory/${language}.json`);

// Read and parse JSON content from the files
const langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
const oryLangData = JSON.parse(fs.readFileSync(oryLangFilePath, 'utf8'));

// Merge the JSON data
const mergedTranslations = {
  ...langData,
  ...oryLangData,
};

const lang = createI18nFixture({
  options: {
    debug: false,
    ns: ['translations'],
    supportedLngs: ['en', 'de'],
    cleanCode: true,
    resources: {
      [language]: {
        translations: mergedTranslations,
      },
    },
  },
  cache: true,
  auto: true,
});

export const test = base.extend(lang);

test.beforeAll(async ({ i18n }) => {
  // Set the language before tests start
  i18n.changeLanguage(language);
});
