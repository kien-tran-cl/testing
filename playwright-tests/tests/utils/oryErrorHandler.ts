import { Page, TestInfo } from "@playwright/test"; // Import TestInfo
import fs from "fs";

/**
 * Handles test failure by capturing a screenshot and saving page content if blocked by Ory.
 * @param {Page} page - The Playwright page object.
 * @param {TestInfo} testInfo - The Playwright TestInfo object that includes details of the test.
 */
export async function handleTestFailure(page: Page, testInfo: TestInfo) {
    try {
        const testTitle = testInfo.title; // Get the test title from testInfo
        const status = testInfo.status; // Get the test status from testInfo
        
        // Capture the page content
        const content = await page.content();

        // Check for Ory block error by looking for a specific error message
        const isBlockedByOry = content.includes('{"error":{"code":"429","details":{"ruleId":"d8ea80f2"},"message":"Too Many Requests","reason":"Too many API requests from your IP have been registered.","status":"Blocked"}}');

        // Only handle failures
        if (status === "failed") {
            if (isBlockedByOry) {
                console.error(`Test "${testTitle}" failed due to a third-party issue: Blocked by Ory.`);
                console.error("URL:", page.url());

                // Save a screenshot for debugging purposes
                const screenshotPath = `ory-blocked-${testTitle.replace(/\s+/g, "_")}.png`;
                await page.screenshot({ path: screenshotPath });
                console.error(`Screenshot saved at: ${screenshotPath}`);

                // Save the page HTML content for debugging purposes
                const htmlPath = `ory-blocked-${testTitle.replace(/\s+/g, "_")}.html`;
                fs.writeFileSync(htmlPath, content);
                console.error(`HTML content saved at: ${htmlPath}`);
            } else {
                console.error(`Test "${testTitle}" failed for other reasons.`);
            }
        }
    } catch (err) {
        console.error("Error while handling test failure:", err);
    }
}
