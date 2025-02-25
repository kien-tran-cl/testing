import { Page, expect } from "@playwright/test";
import { activitiesSelectors, sidebarSelectors } from "./utils/selectors";
import { login, verifyOtp, appUrl } from "./utils/auth-utils";

// Environment variable checks
const checkEnvVar = (varName: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${varName} is not defined in environment variables.`);
  }
};

// Validate required environment variables before running tests
checkEnvVar("USER_EMAIL", process.env.USER_EMAIL);

const { USER_EMAIL } = process.env;

/**
 * Perform login as part of a common setup for tests.
 * @param page Playwright page instance
 * @param email User email address to login
 */
export async function loginBeforeTest(page: Page, email: string = "") {
  console.log("Starting common login process...");
  
  await login(page, USER_EMAIL!); // Reuse the login function from auth-utils
  await page.waitForLoadState("networkidle"); // Ensure the page has fully loaded
  await verifyOtp(page, USER_EMAIL!);
  await page.waitForSelector(activitiesSelectors.headerTitle, {
    state: "visible",
  });
  
  console.log("Login completed.");
}

/**
 * Get user information from API response after login
 * Returns givenName, surname, and fullName
 */
export const getUserInfo = async (page: Page) => {
  let userInfo: any = null;

  // Listen for API responses
  page.on("response", async (response) => {
    const url = response.url();
    
    // Check if the response is from the user info API
    if (url.includes("/api/v1/user/info")) {
      try {
        const body = await response.json();
        console.log("✅ User info API response:", body);
        userInfo = body.data;
      } catch (error) {
        console.error("❌ Error parsing user info response:", error);
      }
    }
  });

  // Reload the page to capture API requests in the Network tab
  await page.reload();

  // Wait to ensure the API response is captured
  await page.waitForTimeout(2000);

  if (!userInfo) throw new Error("User info API response not found");

  return {
    givenName: userInfo.givenName,
    surname: userInfo.surname,
    fullName: `${userInfo.givenName} ${userInfo.surname}`,
  };
};

/**
 * Perform logout after a test.
 * @param page Playwright page instance
 */
export async function logoutAfterTest(page: Page) {
  // Check if sidebar is already open
  const isSidebarVisible = await page
    .locator(sidebarSelectors.sidebar)
    .isVisible();
    
  if (!isSidebarVisible) {
    console.log(
      "Sidebar is not visible. Clicking hamburger icon to open it...",
    );
    await page.locator(sidebarSelectors.hamburgerIcon).click();
  } else {
    console.log("Sidebar is already visible. Skipping hamburger icon click...");
  }

  await page.locator(sidebarSelectors.logout).click();
  await page.waitForLoadState("networkidle");
  expect(page.url()).toContain(appUrl("/ui/login"));

  console.log("Logout completed.");
}
