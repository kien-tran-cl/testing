import { expect } from "playwright/test";
import { test } from "../base";
import { activitiesSelectors, billingComplaintsPageSelectors, dialogSort, searchFilter } from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";
import { scrollAndValidateLoadMore, validateVisibleItems, verifyFirstItemComponents } from "../utils/pageListing-utils";
import { toggleAndSetDisplayOrder, validateItemDisplayOrder } from "../utils/sorting-utils";
import { applySingleCompanyFilterAndVerify, applyStatusFilterAndVerify } from "../utils/filter-utils";
import { verifySearchFunction } from "../utils/search-utils";

test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E - Billing Complaints Search & Filtering", () => {
    test.describe.configure({
        timeout: 90000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrl());
        await page.locator(activitiesSelectors.billingComplaintsCard).click();
        await expect(page).toHaveURL(appUrl("/activities/billing-complaints/list"));
        await page.waitForLoadState("networkidle");
    });

    test("Verify Billing Complaints Search & Filter", async ({ page, i18n }) => {
        await test.step("Step 1: Verify Billing Complaints page components", async () => {
            // Step 1.1: Verify the default number of visible items are between 1-20
            const visibleItemCount = await validateVisibleItems(
                page,
                billingComplaintsPageSelectors.billingComplaintItem,
                billingComplaintsPageSelectors.billingComplaintSkeletonItem,
            );

            // Step 1.2: Verify components inside the first card: 
            if (visibleItemCount > 0) {
                const firstCard = page.locator(billingComplaintsPageSelectors.billingComplaintItem).nth(0);

                await verifyFirstItemComponents(firstCard, [
                    billingComplaintsPageSelectors.status,
                    billingComplaintsPageSelectors.title,
                    billingComplaintsPageSelectors.contactPerson,
                    billingComplaintsPageSelectors.contactPerson,
                    billingComplaintsPageSelectors.companyName,
                    billingComplaintsPageSelectors.date
                ]);
            }
        });

        await test.step("Step 2: Verify scroll to load function", async () => {
            // Step 2.1: Scroll and validate new items are loaded 
            const updatedVisibleItemCount = await scrollAndValidateLoadMore(
                page,
                billingComplaintsPageSelectors.itemCount,
                billingComplaintsPageSelectors.billingComplaintItem,
                billingComplaintsPageSelectors.billingComplaintSkeletonItem,
            );
        });

        await test.step("Step 3: Verify sorting items function", async () => {
            // Step 3.1: Verify default Date Descending sorting before interaction
            await validateItemDisplayOrder(
                page,
                billingComplaintsPageSelectors.billingComplaintItem,
                billingComplaintsPageSelectors.date,
                "desc"
            );

            // Step 3.2: Toggle sorting dialog and change to ascending order
            await toggleAndSetDisplayOrder(
                page,
                billingComplaintsPageSelectors.billingComplaintItem,
                billingComplaintsPageSelectors.date,
                "desc",
                "asc"
            );

            // Step 3.3: Verify items sorted in ascending order
            await validateItemDisplayOrder(
                page,
                billingComplaintsPageSelectors.billingComplaintItem,
                billingComplaintsPageSelectors.date,
                "asc"
            );
        });

        // Variable to store the total number of Billing Complaints cards from Company(client) filter (Step 4)
        let parentFilterTotalItems = 0;
        let selectedClientFilterText = "";
        let selectedStatusFilterText = "";
        
        await test.step("Step 4: Verify filtering Billing Complaints based on Client Company", async () => {
            const results = await applySingleCompanyFilterAndVerify(page, "Billing Complaints");

            if (results && results.companyTotalItems > 0) {
                selectedClientFilterText = results.companyName;
                parentFilterTotalItems = results.companyTotalItems;
            };
        });

        await test.step("Step 5: Verify filtering Billing Complaints based on Status", async ()=> {
            const results = await applyStatusFilterAndVerify(page, parentFilterTotalItems, selectedClientFilterText);
            if (!results) return;

            selectedStatusFilterText = results.selectedStatuses.join(", ");

            const sortText = await page.locator(dialogSort.sortText).innerText();
            const match = /^\d+/.exec(sortText);
            const sortNumber = parseInt(match?. [0] ?? "0", 10);
            expect(sortNumber).toBe(results?.totalSelectedItems);
        });

        await test.step("Step 6: Verify Search function", async() => {
            await verifySearchFunction({
                page,
                searchInput: page.locator(searchFilter.inputField),
                headerTitle: page.locator(billingComplaintsPageSelectors.headerTitle),
                resultCardsLocator: page.locator(billingComplaintsPageSelectors.companyName),
                clientFilterTextLocator: page.locator(searchFilter.clientFilterText),
                emptyMessageLocator: page.locator(searchFilter.emptyFilterMessage),
                emptyResetButtonLocator: page.locator(searchFilter.emptyFilterResetButton),
                selectedClientFilterText,
                i18n,
            });
        });

        await test.step("Step 7: Verify Cancel Search function", async () => {            
            // Click on the 'Cancel' button in the search bar
            await page.locator(searchFilter.cancelSearch).click();

            // -> Verify the name of the selected company is displayed on the right side of the search bar.
            const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();

            if (currentClientFilterText.trim() === selectedClientFilterText) {                
            } else {
                console.error(
                    "Error: The client filter text does not match the value selected in Step 4.",
                );
            }
            // -> Verify the status filter button is in the inactive state and hidden.
            await page.waitForSelector(`${searchFilter.multiselectFilter} >> nth=1`, {
                state: "hidden",
            })

            // -> Verify the list is not empty
            await page.waitForSelector(billingComplaintsPageSelectors.billingComplaintItem, {
                state: "visible",
            });
        });
    });
});