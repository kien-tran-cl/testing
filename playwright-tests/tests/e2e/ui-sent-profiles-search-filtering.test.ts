import { test } from "../base";
import { expect } from "playwright/test";
import { loginBeforeTest } from "../common";
import { activitiesSelectors, dialogSort, searchFilter, sentProfilePageSelectors } from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";
import { scrollAndValidateLoadMore, validateVisibleItems, verifyFirstItemComponents } from "../utils/pageListing-utils";
import { toggleAndSetDisplayOrder, validateItemDisplayOrder } from "../utils/sorting-utils";
import { applyOccupationFilterAndVerify, applySingleCompanyFilterAndVerify, applyStatusFilterAndVerify } from "../utils/filter-utils";

test.describe("E2E - Sent Profiles Search & Filtering", () => {
    test.describe.configure({
        timeout: 90000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await loginBeforeTest(page);
        await page.locator(activitiesSelectors.sentProfileCard).click();
        await expect(page).toHaveURL(appUrl("/activities/sent-profiles/list"));
        await page.waitForLoadState("networkidle");
    });

    test("Verify Sent Profiles Search & Filter", async ({ page, i18n }) => {
        await test.step("Step 1: Verify Sent Profiles page components", async () => {
            // Step 1.1: Verify the default number of visible items are between 1-20
            const visibleItemCount = await validateVisibleItems (
                page,
                sentProfilePageSelectors.profileItem,
                sentProfilePageSelectors.profileSkeletonItem,
            );

            // Step 1.2 Verify components inside the first card
            if (visibleItemCount > 0) {
                const firstCard = page.locator(sentProfilePageSelectors.profileItem).nth(1);

                await verifyFirstItemComponents(firstCard, [
                    sentProfilePageSelectors.status,
                    sentProfilePageSelectors.workerName,
                    sentProfilePageSelectors.occupation,
                    sentProfilePageSelectors.companyName,
                    sentProfilePageSelectors.date,
                    sentProfilePageSelectors.downloadButton
                ]);
            }
        });

        await test.step("Step 2: Verify scroll to load function", async () => {
            // Step 2.1: Scroll and validate new items are loaded
            const updatedVisibleItemCount = await scrollAndValidateLoadMore(
                page,
                sentProfilePageSelectors.itemCount,
                sentProfilePageSelectors.profileItem,
                sentProfilePageSelectors.profileSkeletonItem,
            );
        });

        await test.step("Step 3: Verify sorting items function", async () => {
            // Step 3.1: Verify default Date Descending sorting before any interaction
            await validateItemDisplayOrder(
                page,
                sentProfilePageSelectors.profileItem,
                sentProfilePageSelectors.date,
                "desc"
            );

            // Step 3.2: Toggle sorting dialog and change to ascending order
            await toggleAndSetDisplayOrder(
                page,
                sentProfilePageSelectors.profileItem,
                sentProfilePageSelectors.date,
                "desc",
                "asc",
            );

            // Step 3.3: Verify items sorted in ascending order
            await validateItemDisplayOrder(
                page,
                sentProfilePageSelectors.profileItem,
                sentProfilePageSelectors.date,
                "asc"
            );
        });

        // Variables to store the total number of Profiles cards from Company(client) filter (step 4)
        let parentFilterTotalItems = 0;
        let selectedClientFilterText = "";
        let selectedStatusFilterText = "";

        await test.step("Step 4: Verify filtering Profiles based on Client Company", async () => {
            const results = await applySingleCompanyFilterAndVerify(page, "Sent Profiles");

            if (results && results.companyTotalItems > 0) {
                selectedClientFilterText = results.companyName;
                parentFilterTotalItems = results.companyTotalItems;
            };
        });

        await test.step("Step 5: Verify filtering Profiles based on Status", async () => {
            const results = await applyStatusFilterAndVerify(page, parentFilterTotalItems, selectedClientFilterText);
            if (!results) return;

            selectedStatusFilterText = results.selectedStatuses.join(", ");

            const sortText = await page.locator(dialogSort.sortText).innerText();
            const match = /^\d+/.exec(sortText);
            const sortNumber = parseInt(match?.[0] ?? "0", 10);
            expect(sortNumber).toBe(results.totalSelectedItems);
        });

        await test.step("Step 6: Verify cancelling filter action", async () => {
            await page.locator(searchFilter.cancelSearch).click();

            const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
            expect(currentClientFilterText.trim()).toBe(selectedClientFilterText.trim()); // Name of the selected company is still displayed on the right side of the search bar.
            
            const filterOptionsCouunt = await page.locator(searchFilter.multiselectFilter).count();
            expect(filterOptionsCouunt).toEqual(1); // Only Client Company filter remain 
            
            await page.waitForSelector(sentProfilePageSelectors.profileItem, {
                state: "visible",
            });
        });

        await test.step("Step 7: Verify filtering Profiles based on Occupations", async () => {
            const results = await applyOccupationFilterAndVerify(page, parentFilterTotalItems, selectedClientFilterText);
            if (!results) return;

            selectedStatusFilterText = results.selectedStatuses.join(", ");

            const sortText = await page.locator(dialogSort.sortText).innerText();
            const match = /^\d+/.exec(sortText);
            const sortNumber = parseInt(match?.[0] ?? "0", 10);
            expect(sortNumber).toBe(results.totalSelectedItems);
        });

        await test.step("Step 8: Verify Search function", async () => {
            const positiveSearch = "GEDAT";
            const negativeSearch = "abcxyz";
            const searchInput = page.locator(searchFilter.inputField);

            // Use 'GMBH' as search term (Positive search)
            await searchInput.fill(positiveSearch);
            await page.waitForTimeout(2000);
            await page.locator(sentProfilePageSelectors.headerTitle).click();

            // -> Verify the list shows results that match the search term. (results related to GMBH display on page)
            // Wait for search result to load
            const searchResultProfilesCards = page.locator(
                sentProfilePageSelectors.companyName,
            ); 
            const searchReusultsCount = await searchResultProfilesCards.count();

            const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
            expect(currentClientFilterText.trim()).toBe(selectedClientFilterText.trim()); // Name of the selected company is still displayed on the right side of the search bar.
            
            expect(searchReusultsCount).toBeGreaterThan(0);

            // CHeck if at least one result contains the search keyword
            let matchFound = false;

            for (let i = 0; i < searchReusultsCount; i++) {
                const card = searchResultProfilesCards.nth(i);
                const cardContent = await card.textContent();

                // If a match if found, stop further checks
                if (cardContent?.toLowerCase().includes(positiveSearch.toLocaleLowerCase())) {
                    matchFound = true;
                    break;
                }
            };

            expect(matchFound).toBeTruthy();

            // Use 'abcxyz' as search term (Negative search)
            await searchInput.fill(negativeSearch);
            await page.waitForTimeout(2000);
            await page.locator(sentProfilePageSelectors.headerTitle).click();
            
            // -> Verify no result related to 'abcxyz' found
            expect(searchResultProfilesCards).toBeHidden();
            const newClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
            expect(newClientFilterText.trim()).toBe(selectedClientFilterText.trim()); // Name of the selected company is still displayed on the right side of the search bar.
            
            await expect(page.locator(searchFilter.emptyFilterMessage)).toHaveText(i18n.t("common.emptyFilter.desc"));
            await expect(page.locator(searchFilter.emptyFilterResetButton)).toHaveText(i18n.t("common.emptyFilter.button"));
        });
    });
});