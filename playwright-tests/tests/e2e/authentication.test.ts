import { expect } from "@playwright/test";
import { test  } from "../base";
import {
  activitiesSelectors,
  loginPageSelectors,
  loginVerificationSelectors,
} from "../utils/selectors";
import { appUrl, invalidOtp, clearOtp, verifyOtp } from "../utils/auth-utils";
import { handleTestFailure } from "../utils/oryErrorHandler";

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

test.use ({ storageState: undefined });
test.describe("E2E Tests - Login with email OTP code", () => {
    test.describe.configure({
        timeout: 60000,
        mode: "serial",
    });

    test.afterEach(async ({ page }, testInfo) => {
      if (testInfo.status === "failed") {
        await handleTestFailure(page, testInfo); 
      }
    });

    test("Verify Login with email OTP code", async ({ page, i18n }) => {
        await test.step("Verify login with invalid email", async () => {
            await page.goto(appUrl());
            await page.fill(loginPageSelectors.emailInput, INVALID_EMAIL!);
            await page.click(loginPageSelectors.continueButton);
        
            const warningInvalidEmail = page.locator(
              loginPageSelectors.emailWarningMessage,
            );
            await expect(warningInvalidEmail).toBeVisible();
            expect(warningInvalidEmail).toHaveText(i18n.t("common.validationMessages.email"));
        });

        await test.step("Verify login with invalid tenant email", async () => {
            await page.fill(loginPageSelectors.emailInput, INVALID_TENANT!);
            await page.click(loginPageSelectors.continueButton);

            await expect(
                page.locator(loginPageSelectors.tenantWarningMessage),
              ).toBeVisible();
              const warningInvalidTenant = page.locator(
                loginPageSelectors.tenantWarningMessage,
              );
              await expect(warningInvalidTenant).toBeVisible();
              await expect(warningInvalidTenant).toHaveText(i18n.t("4000035.text"), { timeout: 5000 });
        });

        await test.step("Verify login with invalid OTP", async () => {    
            // Step 1: Log in with a valid email to reach the OTP verification page
            await page.fill(loginPageSelectors.emailInput, USER_EMAIL!);
            await page.click(loginPageSelectors.continueButton);
            await page.waitForLoadState("networkidle"); // Ensure the page has fully loaded

        
            // Step 2: Submit an invalid OTP
            await page.waitForSelector(loginVerificationSelectors.otpInput, {
                state: "visible",
                timeout: 5000,
            });
            await invalidOtp(page);
        
            // Step 3: Verify the error message for invalid OTP
            await expect(
              page.locator(loginVerificationSelectors.otpWarningMessage),
            ).toBeVisible();
            const otpWarningMessage = page.locator(
              loginVerificationSelectors.otpWarningMessage,
            );
            await expect(otpWarningMessage).toBeVisible();
            await expect(otpWarningMessage).toHaveText(i18n.t("4010008.text"), { timeout: 5000 });
        });

        await test.step("Verify login successfully with valid email and OTP", async () => {
            // Step 1: Clear the existing invalid OTP
            await clearOtp(page);

            // Step 2: Fill in the valid OTP
            await verifyOtp(page, USER_EMAIL!);

            // Step 3: Verify login successfully, user navigated to the Activities page
            await page.waitForSelector(activitiesSelectors.headerTitle, {
                state: "visible",
                timeout: 30000,
            });
          
            const activitiesHeader = page.locator(activitiesSelectors.headerTitle);
            await expect(activitiesHeader).toHaveText(i18n.t("pages.activities.title"),{ timeout: 5000 });
        });
    });
});
