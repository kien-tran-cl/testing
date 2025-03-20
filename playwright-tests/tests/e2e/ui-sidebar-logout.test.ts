import { expect } from "@playwright/test";
import { test } from "../base";
import {
  informationPagesSelectors,
  loginPageSelectors,
  sidebarSelectors,
} from "../utils/selectors";
import { getUserInfo, loginBeforeTest, logoutAfterTest} from "../common";
import { appUrl } from "../utils/auth-utils";

// Environment variable checks
const checkEnvVar = (varName: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${varName} is not defined in Environment variables.`);
  }
};

// Validate required environment variables before running tests
checkEnvVar("USER_EMAIL", process.env.USER_EMAIL);

const { USER_EMAIL } = process.env;
test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E Test - Sidebar & Logout", () => {
  test.describe.configure({
    timeout: 60000,
    mode: "serial",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl());
  });

  test("Verify Sidebar and Logout", async ({ page, i18n }) => {
    await test.step("Verify sidebar is hidden by default", async () => {
      await expect(page.locator(sidebarSelectors.sidebar)).toBeHidden();
    });

    await test.step("Verify clicking on burger menu open the sidebar with expected components", async () => {
      // Clicking on burger menu open the sidebar
      await page.locator(sidebarSelectors.hamburgerIcon).click();
      await expect(page.locator(sidebarSelectors.sidebar)).toBeVisible();

      // Legal components
      await expect(page.locator(sidebarSelectors.legal)).toBeVisible();
      await expect(page.locator(sidebarSelectors.termsOfService)).toBeVisible();
      await expect(page.locator(sidebarSelectors.dataPrivacy)).toBeVisible();
      // General components
      await expect(page.locator(sidebarSelectors.support)).toBeVisible();
      await expect(page.locator(sidebarSelectors.logout)).toBeVisible();
      // Profile info components
      await expect(page.locator(sidebarSelectors.userInfoFullName)).toBeVisible();
      await expect(page.locator(sidebarSelectors.userInfoEmail)).toBeVisible();
      await expect(page.locator(sidebarSelectors.userInfoProfileImage)).toBeVisible();
    });

    await test.step("Verify click outside the sidebar to close it", async () => {
      // Get the viewport size, if it's not null then calculate the click position
      const viewportSize = await page.viewportSize();
      if (viewportSize) {
        const { width, height } = viewportSize; // Destructure the width and height of the viewport
        const x = width - 1; // Click/Tap position at the far right (horizontal axis)
        const y = height / 2; // Click/Tap position at the center vertically (vertical axis)
        await page.touchscreen.tap(x, y); // Use 'tap' for mobile devices to simulate a touch event
      } else {
        console.error("Unable to retrieve viewport size."); // Log error if viewport size cannot be fetched
      }

      await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
    });

    await test.step("Verify Legal Notice navigation", async () => {
      await page.locator(sidebarSelectors.hamburgerIcon).click();
      await expect(page.locator(sidebarSelectors.sidebar)).toBeVisible();
  
      await page.locator(sidebarSelectors.legal).click();
      await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
      await expect(page).toHaveURL(appUrl("/legal-notice"));
    });

    await test.step("Verify Terms of services navigation", async () => {
      await page.locator(informationPagesSelectors.backArrow).click();
      await page.locator(sidebarSelectors.hamburgerIcon).click();
  
      await page.locator(sidebarSelectors.termsOfService).click();
      await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
      await expect(page).toHaveURL(appUrl("/term-services"));
    });

    await test.step("Verify Data privacy policy navigation", async () => {
      await page.locator(informationPagesSelectors.backArrow).click();
      await page.locator(sidebarSelectors.hamburgerIcon).click();
  
      await page.locator(sidebarSelectors.dataPrivacy).click();
      await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
      await expect(page).toHaveURL(appUrl("/data-privacy"));
    });

    await test.step("Verify Support navigation", async () => {
      await page.locator(informationPagesSelectors.backArrow).click();
      await page.locator(sidebarSelectors.hamburgerIcon).click();
  
      await page.locator(sidebarSelectors.support).click();
      await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
      await expect(page).toHaveURL(appUrl("/support"));
    });

    await test.step("Verify display of User Fullname", async () => {
      await page.locator(informationPagesSelectors.backArrow).click();
  
      try {
        const userInfo = await getUserInfo(page);
        console.log('Given Name:', userInfo.givenName);
        console.log('Surname:', userInfo.surname);
        console.log('Full Name:', userInfo.fullName);
        
        // Open Sidebar 
        await page.locator(sidebarSelectors.hamburgerIcon).click();

        // Verify user info full name in the UI
        const fullNameLocator = page.locator(sidebarSelectors.userInfoFullName);
  
        // Check if the full name element is visible
        await expect(fullNameLocator).toBeVisible();
  
        // Get the text content from the full name element in the UI
        const fullNameFromUI = await fullNameLocator.innerText();
  
        // Assert that the full name from the UI matches the full name from the API
        expect(fullNameFromUI).toBe(userInfo.fullName);
      } catch (error) {
        console.error("Error getting user info:", error);
      };
    });

    await test.step("Verify display of User Email", async () => {
      const emailFromUI = await page
      .locator(sidebarSelectors.userInfoEmail)
      .innerText();
      expect(emailFromUI).toBe(USER_EMAIL);
    });

    await test.step("Verify display of User Profile Image", async () => {
      const imageSrc = await page
      .locator(sidebarSelectors.userInfoProfileImage + " img")
      .getAttribute("src");
      expect(imageSrc).not.toBeNull();
      expect(imageSrc).toMatch(/^https?:\/\//);
    });

    await test.step("Verify Logout and redirection to Login page", async () => {
      await logoutAfterTest(page);
      await expect(page.locator(loginPageSelectors.emailInput)).toBeVisible();
    });
  });
});
