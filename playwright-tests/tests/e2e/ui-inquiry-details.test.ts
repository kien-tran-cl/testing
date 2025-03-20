import { expect } from "playwright/test";
import { test } from "../base";
import { loginBeforeTest } from "../common";
import { 
    activitiesSelectors,
    contactDetailPage,
    inquiriesPageSelectors, 
    inquiryDetailPageSelectors 
} from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";

test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E Test - Inquiry Details", () => {
    test.describe.configure({
        timeout: 60000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrl());
    });

    test("Verify Inquiry Details", async ({ page, i18n }) => {
        await test.step("Verify visibility of main Inquiry Details components", async () => {
            // Step 1: Access Inquiry Details page
            await page.locator(activitiesSelectors.inquiriesCard).click();
            await page.waitForTimeout(2000);
            await page.locator(`${inquiriesPageSelectors.inquiriesItem} >> nth=0`).click();
            await page.waitForTimeout(3000);

            expect(page.url()).toContain(appUrl("/activities/inquiries/list/"));

            // Step 2: Verify components are all displaying
            const itemsHeader = [
                inquiryDetailPageSelectors.occupation,
                inquiryDetailPageSelectors.companyName,
                inquiryDetailPageSelectors.status,
            ];

            const itemsBody = page.locator(inquiryDetailPageSelectors.inquiriesDetailItem);
            const expectedBodyTitles = [
                i18n.t("pages.activities.activityDetails.created"),
                i18n.t("pages.activities.activityDetails.startDate"),  
                i18n.t("pages.activities.activityDetails.temporaryWorker"), 
                i18n.t("pages.activities.activityDetails.typeOfEmployment"), 
                i18n.t("pages.activities.activityDetails.address"), 
                i18n.t("pages.activities.activityDetails.contactPerson"), 
                i18n.t("pages.activities.activityDetails.runningNumber"), 
            ];

            // Verify that all header items are visible
            await Promise.all(
                itemsHeader.map(locator => expect.soft(page.locator(locator)).toBeVisible())
            );

            // Verify the body display all items (7)
            await expect.soft(itemsBody).toHaveCount(7);
            
            // Step 3: Verify each body item (title and value)
            for (let i = 0; i < 7; i++) {
                const item = itemsBody.nth(i);
                const title = item.locator("h5");
                const value = item.locator("h4");
        
                await expect.soft(item).toBeVisible();  // Main component
                await expect.soft(title).toBeVisible(); // Title
                await expect.soft(value).toBeVisible(); // Value

                // Verify the title text
                const titleText = await title.innerText();
                await expect.soft(titleText.trim()).toBe(expectedBodyTitles[i]);
                console.log(expectedBodyTitles[i]);

                // Verify that value is not empty
                const valueText = await value.innerText();
                await expect.soft(valueText.trim()).not.toBe(""); // Ensure it's not empty
            }
        });

        await test.step("Verify Contact Detail page components", async () => {
            // Step 1: Get the given name and surname showing on Inquiry Details page
            const contactLocator = page.locator(inquiryDetailPageSelectors.contactPerson);
            const contactName = await contactLocator.innerText();
            console.log("contact name is:", contactName);
        
            // Step 2: Click on the name of the contact person
            await contactLocator.click();
        
            // Step 3: Wait for the page to load completely (wait until "load" state)
            await page.waitForTimeout(3000);
            await page.waitForLoadState("networkidle"); // Wait until the page has fully loaded
        
            // Step 4: Wait for the actual contact name to be visible
            const contactDetailLocator = page.locator(contactDetailPage.name);
            await contactDetailLocator.waitFor({ state: 'visible' });
        
            // Step 5: Verify surname and title match the one shown in the inquiry details.
            const contactDetailName = await contactDetailLocator.innerText();
            expect(contactDetailName.trim()).toBe(contactName.trim());
        });
        
        await test.step("Verify Back button navigate to Inquiry Details page", async () => {
            // Step 1: Click on back arrow button
            await page.locator(contactDetailPage.backArrow).click();

            // Step 2: Verify navigation to Inquiry Details page successfully
            await page.waitForTimeout(3000);
            await page.waitForLoadState("networkidle");
            expect(page.url()).toContain(appUrl("/activities/inquiries/list/"));
        });
    });
});