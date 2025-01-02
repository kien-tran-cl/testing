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
  return new Promise<{
    givenName: string;
    surname: string;
    fullName: string;
  }>((resolve, reject) => {
    page.on('response', async (response) => {
      try {
        // Check if the response URL matches the user info endpoint
        if (response.url().includes('/api/v1/user/info')) {
          const data = await response.json();

          // Ensure the response contains the expected data
          if (data?.data?.givenName && data?.data?.surname) {
            const givenName = data.data.givenName;
            const surname = data.data.surname;
            const fullName = `${givenName} ${surname}`; // Concatenate givenName and surname to get fullName

            resolve({
              givenName,
              surname,
              fullName,
            });
          } else {
            reject(new Error("Missing expected fields in response"));
          }
        }
      } catch (error) {
        reject(new Error("Error parsing response: " + error));
      }
    });
  });
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
