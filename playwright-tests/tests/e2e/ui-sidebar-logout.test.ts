import { test, expect } from "@playwright/test";
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

test.describe("E2E Test - Sidebar & Logout", () => {
  test.describe.configure({
    timeout: 60000,
    mode: "serial",
  });

  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page, USER_EMAIL);
  });

  test("Verify Sidebar and Logout", async ({ page }) => {
    // Sub Step: Verify side bar hidden by default
    await expect(page.locator(sidebarSelectors.sidebar)).toBeHidden();

    // Step 1: Verify clicking on burger menu open the sidebar with expected components
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


    // Step 2: Verify click outside the sidebar to close it
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

    // Step 3: Verify navigation of 'Legal notice'
    await page.locator(sidebarSelectors.hamburgerIcon).click();
    await expect(page.locator(sidebarSelectors.sidebar)).toBeVisible();

    await page.locator(sidebarSelectors.legal).click();
    await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
    await expect(page).toHaveURL(appUrl("/legal-notice"));

    // Step 4: Verify navigation of 'Terms of services'
    await page.locator(informationPagesSelectors.backIcon).click();
    await page.locator(sidebarSelectors.hamburgerIcon).click();

    await page.locator(sidebarSelectors.termsOfService).click();
    await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
    await expect(page).toHaveURL(appUrl("/term-services"));

    // Step 5: Verify navigation of 'Data privacy policy'
    await page.locator(informationPagesSelectors.backIcon).click();
    await page.locator(sidebarSelectors.hamburgerIcon).click();

    await page.locator(sidebarSelectors.dataPrivacy).click();
    await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
    await expect(page).toHaveURL(appUrl("/data-privacy"));

    // Step 6: Verify navigation of 'Support'
    await page.locator(informationPagesSelectors.backIcon).click();
    await page.locator(sidebarSelectors.hamburgerIcon).click();

    await page.locator(sidebarSelectors.support).click();
    await expect(page.locator(sidebarSelectors.sidebar)).not.toBeVisible();
    await expect(page).toHaveURL(appUrl("/support"));

    // Step 7: Verify display of user FullName
    await page.goto(appUrl(""));
    await page.locator(sidebarSelectors.hamburgerIcon).click();

    try {
      const userInfo = await getUserInfo(page);
      console.log('Given Name:', userInfo.givenName);
      console.log('Surname:', userInfo.surname);
      console.log('Full Name:', userInfo.fullName);

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

    // Step 8: Verify display of user Email
    const emailFromUI = await page
    .locator(sidebarSelectors.userInfoEmail)
    .innerText();
    expect(emailFromUI).toBe(USER_EMAIL);

    // Step 9: Verify display of profile image 
    const imageSrc = await page
    .locator(sidebarSelectors.userInfoProfileImage + " img")
    .getAttribute("src");
    expect(imageSrc).not.toBeNull();
    expect(imageSrc).toMatch(/^https?:\/\//);

    // Step 7: Verify Logout and redirection to login page
    await logoutAfterTest(page);
    await expect(page.locator(loginPageSelectors.emailInput)).toBeVisible();
  });
});
