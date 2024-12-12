import { Page } from '@playwright/test';
import {
  loginPageSelectors,
  loginVerificationSelectors,
} from './utils/selectors';
import { UI } from './utils/utils';
import { fetchOtpCode } from './utils/otp';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Get App URL with optional path.
 * @param path the path to append to the base URL.
 * @returns the full URL.
 */

export const appUrl = (path: string = '') => {
  let baseUrl = (process.env.BASE_URL ?? '').trim();
  if (baseUrl.endsWith('/')) {
    // Remove trailing slash
    baseUrl = baseUrl.slice(0, -1);
  }

  path = path.trim();
  if (path) {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return `${baseUrl}${path}`;
  }

  return baseUrl;
};

/**
 * Helper function to generate a random OTP of a given length.
 * @param length Length of the OTP
 * @returns A string containing a random OTP
 */
export function generateRandomOtp(length: number): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString(); // Generate a random digit
  }
  return otp;
}

/**
 * Login to the application with the given email.
 * @param page Playwright page instance
 * @param email User email address to login
 */
export async function login(page: Page, email: string = '') {
  await page.goto(appUrl());
  await page.waitForLoadState();
  await page.waitForSelector(loginPageSelectors.emailInput, {
    state: 'visible',
  });
  const ui = UI.of(page);
  await ui.fill(loginPageSelectors.emailInput, email);
  await ui.click(loginPageSelectors.continueButton);
  await page.waitForLoadState();
}

/**
 * Perform OTP Verification
 * @param page Playwright page instance
 * @param email User email address to fetch OTP for
 */
export async function verifyOtp(page: Page, email: string) {
  // Fetch the OTP code from the API
  const otp = await fetchOtpCode(email);
  console.log(`Fetched OTP: ${otp}`); // Debug log

  // Wait for the OTP input fields to be visible
  const otpInputs = await page.$$(loginVerificationSelectors.otpInput); // Select all OTP input fields

  if (otpInputs.length !== otp.length) {
    throw new Error('Mismatch between OTP length and input fields count.');
  }

  // Fill each character of the OTP into corresponding input fields
  for (let i = 0; i < otp.length; i++) {
    await otpInputs[i].fill(otp[i]); // Fill each input with the corresponding OTP character
  }

  // Wait for loading OTP and navigate to Activities page
  await page.waitForLoadState(); // Wait for navigation or page update
}

/**
 * Enter an invalid OTP (6 random digits) into the OTP input fields
 * @param page Playwright page instance
 */
export async function invalidOtp(page: Page) {
  // Fetch the random OTP code generated
  const invalidOtp = generateRandomOtp(6); // Generate a 6-digit random OTP
  console.log(`Generated invalid OTP: ${invalidOtp}`);

  // Wait for the OTP input fields to be visible
  const otpInputs = await page.$$(loginVerificationSelectors.otpInput); // Select all OTP input fields

  if (otpInputs.length !== invalidOtp.length) {
    throw new Error('Mismatch between OTP length and input fields count.');
  }

  // Fill each character of the OTP into corresponding input fields
  for (let i = 0; i < invalidOtp.length; i++) {
    await otpInputs[i].fill(invalidOtp[i]); // Fill each input with the corresponding OTP character
  }

  // Wait for loading OTP and navigate to Activities page
  await page.waitForLoadState(); // Wait for navigation or page update  
}

// export async function logout(page: Page) {}
