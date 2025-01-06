import { expect } from "@playwright/test";
import { test  } from "../base";
import {
  activitiesSelectors,
  loginPageSelectors,
  loginVerificationSelectors,
} from "../utils/selectors";
import { appUrl, invalidOtp, login, verifyOtp } from "../utils/auth-utils";

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

  test("verify login with invalid email", async ({ page, i18n }) => {
    await page.goto(appUrl());
    await page.fill(loginPageSelectors.emailInput, INVALID_EMAIL!);
    await page.click(loginPageSelectors.continueButton);

    const warningInvalidEmail = page.locator(
      loginPageSelectors.emailWarningMessage,
    );
    await expect(warningInvalidEmail).toBeVisible();
    expect(warningInvalidEmail).toHaveText(i18n.t("common.validationMessages.email"));
    console.log('warning message when input invalid email is:', i18n.t('common.validationMessages.email'));
  });

  test("verify login with invalid tenant email", async ({ page, i18n }) => {
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
    expect(warningInvalidTenant).toHaveText(i18n.t("4000035.text"));
    console.log('warning message when input invalid tenant email is:', i18n.t('4000035.text'));
  });

  test("verify login with invalid OTP", async ({ page, i18n }) => {
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
    expect(otpWarningMessage).toHaveText(i18n.t("4010008.text"));
    console.log('warning of invalid OTP is:', i18n.t("4010008.text"));
  });

  test("verify login successfully with valid email and OTP", async ({
    page, i18n
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
    expect(activitiesHeader).toHaveText(i18n.t("pages.activities.title"));
    console.log('Default page after logged in is', i18n.t("pages.activities.title"));
  });
});
