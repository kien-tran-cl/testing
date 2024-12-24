import { test, expect } from "@playwright/test";
import {
  activitiesSelectors,
  loginPageSelectors,
  loginVerificationSelectors,
} from "../utils/selectors";
import { appUrl, invalidOtp, login, verifyOtp } from "..utils/auth-utils";

// Environment variable checks
const checkEnvVar = (varName: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${varName} is not defined in environment variables.`);
  }
};

// Validate required environment variables before running tests
checkEnvVar("USER_EMAIL", process.env.USER_EMAIL);
checkEnvVar("INVALID_EMAIL", process.env.INVALID_EMAIL);
checkEnvVar("INVALID_TENANT", process.env.INVALID_TENANT);

const { USER_EMAIL, INVALID_EMAIL, INVALID_TENANT } = process.env;

test.describe("E2E Tests  - Login Page", () => {
  test.describe.configure({
    timeout: 60000,
    mode: "serial",
  });

  test("verify login with invalid email", async ({ page }) => {
    await page.goto(appUrl());
    await page.fill(loginPageSelectors.emailInput, INVALID_EMAIL!);
    await page.click(loginPageSelectors.continueButton);

    const warningInvalidEmail = page.locator(
      loginPageSelectors.emailWarningMessage,
    );
    await expect(warningInvalidEmail).toBeVisible();
    await expect(warningInvalidEmail).toHaveText(
      "Please enter a valid email address",
    );
  });

  test("verify login with invalid tenant email", async ({ page }) => {
    await page.goto(appUrl());
    await page.fill(loginPageSelectors.emailInput, INVALID_TENANT!);
    await page.click(loginPageSelectors.continueButton);

    await expect(
      page.locator(loginPageSelectors.tenantWarningMessage),
    ).toBeVisible();
    const warningInvalidTenant = page.locator(
      loginPageSelectors.tenantWarningMessage,
    );
    await expect(warningInvalidTenant).toBeVisible();
    await expect(warningInvalidTenant).toHaveText(
      "Please enter a valid email address.",
    );
  });

  test("verify login with invalid OTP", async ({ page }) => {
    // Step 1: Log in with a valid email to reach the OTP verification page
    await login(page, USER_EMAIL!);
    await page.waitForSelector(loginVerificationSelectors.otpInput, {
      state: "visible",
      timeout: 5000,
    });

    // Step 2: Submit an invalid OTP
    await invalidOtp(page);

    // Step 3: Verify the error message for invalid OTP
    await expect(
      page.locator(loginVerificationSelectors.otpWarningMessage),
    ).toBeVisible();
    const otpWarningMessage = page.locator(
      loginVerificationSelectors.otpWarningMessage,
    );
    await expect(otpWarningMessage).toBeVisible();
    await expect(otpWarningMessage).toHaveText(
      "The login code is invalid or has already been used. Please try again.",
    );
  });

  test("verify login successfully with valid email and OTP", async ({
    page,
  }) => {
    // Step 1: Log in with a valid email to reach the OTP verification page
    await login(page, USER_EMAIL!);
    await page.waitForSelector(loginVerificationSelectors.otpInput, {
      state: "visible",
      timeout: 5000,
    });

    // Step 2: Submit a valid OTP
    await verifyOtp(page, USER_EMAIL!);

    // Step 3: Verify successful navigation to the Activities page
    await page.waitForSelector(activitiesSelectors.headerTitle, {
      state: "visible",
    });

    const activitiesHeader = page.locator(activitiesSelectors.headerTitle);
    await expect(activitiesHeader).toHaveText("Activities", { timeout: 2000 });
  });
});
