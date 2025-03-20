import { Browser, chromium, expect, Page, devices } from "playwright/test";
import { loginBeforeTest } from "./tests/common";
import { appUrl } from "./tests/utils/auth-utils";

async function globalSetup() {
    const browser: Browser = await chromium.launch({ headless: true});
    const context = await browser.newContext({
        ...devices["Pixel 5"],
    });
    const page: Page = await context.newPage();

    await loginBeforeTest(page);
    await expect(page).toHaveURL(appUrl("/activities"));

    // Save the state of the webpage - means we are logged in
    await page.context().storageState({ path: "./LoginAuth.json" });

    await browser.close();
};

export default globalSetup;