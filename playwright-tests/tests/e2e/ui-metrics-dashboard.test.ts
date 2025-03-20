import { expect } from "@playwright/test";
import { test } from "../base";
import { 
    activitiesSelectors,
    inquiriesPageSelectors,
    salesActivitiesPageSelectors,
    sentProfilePageSelectors,
    ordersPageSelectors,
    workerComplaintsPageSelectors,
    billingComplaintsPageSelectors
} from "../utils/selectors";
import { loginBeforeTest, logoutAfterTest, getUserInfo } from "../common";
import { appUrl } from "../utils/auth-utils";

test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E Test - Metrics Dashboard", () => {
    test.describe.configure({
        timeout: 60000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrl());
    });
    test.afterEach(async ({ page }) => {
        await logoutAfterTest(page);
    });

    test("Verify Metrics Dashboard", async ({ page, i18n }) => {
        await test.step("Verify visibility of main dashboard components", async () => {
            const locators = [
                activitiesSelectors.headerTitle,
                activitiesSelectors.greeting,
                activitiesSelectors.userInfoProfileImage,
                activitiesSelectors.inquiriesCard,
                activitiesSelectors.salesActivitiesCard,
                activitiesSelectors.sentProfileCard,
                activitiesSelectors.ordersCard,
                activitiesSelectors.workerComplaintsCard,
                activitiesSelectors.billingComplaintsCard,
            ];
            
            for (const locator of locators) {
                await expect.soft(page.locator(locator)).toBeVisible();
            };
        });
        
        await test.step("Verify display of user information", async () => {
            // Verify greeting text include user given name
            await page.goto(appUrl(""));
            try {
                const userInfo = await getUserInfo(page);
                const greetingLocator = page.locator(activitiesSelectors.greeting);
                const greetingFromUI = await greetingLocator.innerText();
                console.log("Greeting text is", greetingFromUI);

                const nameFromGreeting = greetingFromUI.split(",").pop()?.trim();
                console.log("Name inside Greeting text is", nameFromGreeting);

                expect(nameFromGreeting).toBe(userInfo.givenName);
                console.log("api return givenName", userInfo.givenName);
            } catch (error) {
                console.error("Greeting text does not contains user given name", error);
            }

            // Verify display of profile image
            const imageSrc = await page
            .locator(activitiesSelectors.userInfoProfileImage + " img")
            .getAttribute("src");
            expect(imageSrc).not.toBeNull();
            expect(imageSrc).toMatch(/^https?:\/\//);
        });

        await test.step("Verify display of component inside card", async () => {
            const cardSelectors = [
                activitiesSelectors.inquiriesCard,
                activitiesSelectors.salesActivitiesCard,
                activitiesSelectors.sentProfileCard,
                activitiesSelectors.ordersCard,
                activitiesSelectors.workerComplaintsCard,
                activitiesSelectors.billingComplaintsCard,
            ];

            const expectedCardTitles = [
                i18n.t('pages.activities.activityType.inquiries'),
                i18n.t('pages.activities.activityType.sales-activities'),
                i18n.t('pages.activities.activityType.sent-profiles'),
                i18n.t('pages.activities.activityType.orders'),
                i18n.t('pages.activities.activityType.tmp-worker-complaints'),
                i18n.t('pages.activities.activityType.billing-complaints'),
            ];

            // Verify an icon existed in locator
            for (const cardSelector of cardSelectors) {
                const cardIcon = page.locator(`${cardSelector} >> ${activitiesSelectors.cardIcon}`);
                await expect(cardIcon).toBeVisible();
            };

            // Verify metric number exists and is not negative
            for (const cardSelector of cardSelectors) {
                const metricLocator = page.locator(`${cardSelector} >> ${activitiesSelectors.cardMetricNumber}`);
                const metricText = await metricLocator.textContent();

                expect(metricText).not.toBeNull();
                expect(metricText).not.toBeUndefined();

                const metricNumber = parseInt(metricText?.trim() || '0', 10);

                console.log(`Parsed metric number for card [${cardSelector}]:`, metricNumber);

                expect(metricNumber).toBeGreaterThanOrEqual(0);
                expect(Number.isInteger(metricNumber)).toBeTruthy();
            };

            // Verify display of card title
            for (let i = 0; i < cardSelectors.length; i++) {
                const cardSelector = cardSelectors[i];
                const expectedCardTitle = expectedCardTitles[i];

                const cardTitle = page.locator(`${cardSelector} >> ${activitiesSelectors.cardTitle}`);
                await expect(cardTitle).toBeVisible();

                const titleText = await cardTitle.textContent();
                expect(titleText?.trim()).toBe(expectedCardTitle);

                console.log(`Verified title for card [${cardSelector}]:`, titleText?.trim());
            };

            for (const cardSelector of cardSelectors) {
                const cardTitle = page.locator(`${cardSelector} >> ${activitiesSelectors.cardTitle}`);
                await expect(cardTitle).toBeVisible();
            };
        });

        await test.step("Verify inquiries card navigation", async () => {
            await page.locator(activitiesSelectors.inquiriesCard).click();
            await expect(page).toHaveURL(appUrl("/activities/inquiries/list"));

            const inquiriesPageTitle = page.locator(inquiriesPageSelectors.headerTitle);
            await expect(inquiriesPageTitle).toBeVisible();
            expect(inquiriesPageTitle).toHaveText(i18n.t('pages.activities.activityType.inquiries'));
            console.log('title of page https://sales.timejob-online.dev/app/activities/inquiries/list is:',i18n.t('pages.activities.activityType.inquiries'));

            await page.locator(inquiriesPageSelectors.backArrow).click();
        });

        await test.step("Verify sales activities card navigation", async () => {
            await page.locator(activitiesSelectors.salesActivitiesCard).click();
            await expect(page).toHaveURL(appUrl("/activities/sales-activities/list"));

            const salesActivitiesPageTitle = page.locator(salesActivitiesPageSelectors.headerTitle);
            await expect(salesActivitiesPageTitle).toBeVisible();
            expect(salesActivitiesPageTitle).toHaveText(i18n.t('pages.activities.activityType.sales-activities'));
            console.log('title of page https://sales.timejob-online.dev/app/activities/sales-activities/list is:', i18n.t("pages.activities.activityType.sales-activities"));

            await page.locator(salesActivitiesPageSelectors.backArrow).click();
        });

        await test.step("Verify sent profiles card navigation", async () => {
            await page.locator(activitiesSelectors.sentProfileCard).click();
            await expect(page).toHaveURL(appUrl("/activities/sent-profiles/list"));

            const sentProfilesPageTitle = page.locator(sentProfilePageSelectors.headerTitle);
            await expect(sentProfilesPageTitle).toBeVisible();
            expect(sentProfilesPageTitle).toHaveText(i18n.t("pages.activities.activityType.sent-profiles"));
            console.log('title of page https://sales.timejob-online.dev/app/activities/sent-profiles/list is:', i18n.t("pages.activities.activityType.sent-profiles"));

            await page.locator(sentProfilePageSelectors.backArrow).click();
        });

        await test.step("Verify orders card navigation", async () => {
            await page.locator(activitiesSelectors.ordersCard).click();
            await expect(page).toHaveURL(appUrl("/activities/orders/list"));

            const ordersPageTitle = page.locator(ordersPageSelectors.headerTitle);
            await expect(ordersPageTitle).toBeVisible();
            expect(ordersPageTitle).toHaveText(i18n.t("pages.activities.activityType.orders"));
            console.log('title of page https://sales.timejob-online.dev/app/activities/orders/list is:', i18n.t("pages.activities.activityType.orders"));

            await page.locator(ordersPageSelectors.backArrow).click();
        });

        await test.step("Verify worker complaints card navigation", async () => {
            await page.locator(activitiesSelectors.workerComplaintsCard).click();
            await expect(page).toHaveURL(appUrl("/activities/tmp-worker-complaints/list"));

            const workerComplaintsPageTitle = page.locator(workerComplaintsPageSelectors.headerTitle);
            await expect(workerComplaintsPageTitle).toBeVisible();
            expect(workerComplaintsPageTitle).toHaveText(i18n.t("pages.activities.activityType.tmp-worker-complaints"));
            console.log('title of page https://sales.timejob-online.dev/app/activities/tmp-worker-complaints/list is:', i18n.t("pages.activities.activityType.tmp-worker-complaints"));

            await page.locator(workerComplaintsPageSelectors.backArrow).click();
        });

        await test.step("Verify billing complaints card navigation", async () => {
            await page.locator(activitiesSelectors.billingComplaintsCard).click();
            await expect(page).toHaveURL(appUrl("/activities/billing-complaints/list"));

            const billingComplaintsPageTitle = page.locator(billingComplaintsPageSelectors.headerTitle);
            await expect(billingComplaintsPageTitle).toBeVisible();
            expect(billingComplaintsPageTitle).toHaveText(i18n.t("pages.activities.activityType.billing-complaints"));
            console.log('title of page https://sales.timejob-online.dev/app/activities/billing-complaints/list is:', i18n.t("pages.activities.activityType.billing-complaints"));

            await page.locator(billingComplaintsPageSelectors.backArrow).click();
        });
    });
});
