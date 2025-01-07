import { Page } from "@playwright/test";
import { 
    loginPageSelectors, 
    loginVerificationSelectors 
} from "./selectors";
import { UI } from "./utils";
import { fetchOtpCode } from "./otp";

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
  
  /**
   * Clear OTP input fields like a real user.
   * Simulates clicking the last OTP input and pressing Backspace repeatedly.
   * @param page Playwright page instance
   */
  export async function clearOtp(page: Page) {
    const otpInputs = page.locator(loginVerificationSelectors.otpInput);
    const count = await otpInputs.count();
  
    if (count === 0) {
      throw new Error("No OTP input fields found.");
    }
  
    const lastOtpInput = otpInputs.nth(count - 1);
    await lastOtpInput.click();
  
    // Wait until the OTP input field is focused
    const elementHandle = await lastOtpInput.elementHandle();
    await page.waitForFunction(
      (element) => element === document.activeElement,
      elementHandle
    );
  
    // Clear OTP fields by pressing the Backspace key
    for (let i = 0; i < count; i++) {
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(100); // Simulate user behavior with a small delay
    }
  
    // Add a small delay before checking the values to avoid race condition
    await page.waitForTimeout(200);  // Adjust the time if needed
  
    // Verify if all OTP fields are empty
    for (let i = 0; i < count; i++) {
      const value = await otpInputs.nth(i).inputValue();
      console.log(`OTP field value at index ${i}: "${value}"`);  // Log to check the value
      if (value !== "") {
        throw new Error(`OTP input field at index ${i} is not empty.`);
      }
    }
  }
