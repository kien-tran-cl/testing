import { expect } from "playwright/test";
import { test } from "../base";
import { loginBeforeTest } from "../common";
import { activitiesSelectors, dialogSort, searchFilter, workerComplaintsPageSelectors } from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";
import { scrollAndValidateLoadMore, validateVisibleItems, verifyFirstItemComponents } from "../utils/pageListing-utils";
import { toggleAndSetDisplayOrder, validateItemDisplayOrder } from "../utils/sorting-utils";
import { applySingleCompanyFilterAndVerify, applyStatusFilterAndVerify } from "../utils/filter-utils";
import { verifySearchFunction } from "../utils/search-utils";

test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E - Worker Complaints Search & Filtering", () => {
    test.describe.configure({
        timeout: 90000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrl());
        await page.locator(activitiesSelectors.workerComplaintsCard).click();
        await expect(page).toHaveURL(appUrl("/activities/tmp-worker-complaints/list"));
        await page.waitForLoadState("networkidle");
    });

    test("Verify Worker Complaints Search & FIlter", async ({ page, i18n }) => {
        await test.step("Step 1: Verify Worker Complaints page components", async () => {
            // Step 1.1: Verify the default number of visible items are between 1-20
            const visibleItemCount = await validateVisibleItems (
                page,
                workerComplaintsPageSelectors.workerComplaintItem,
                workerComplaintsPageSelectors.workerComplaintSkeletonItem,
            );

            // Step 1.2: Verify components inside the first card:
            if (visibleItemCount > 0) {
                const firstCard = page.locator(workerComplaintsPageSelectors.workerComplaintItem).nth(0);

                await verifyFirstItemComponents(firstCard, [
                    workerComplaintsPageSelectors.status,
                    workerComplaintsPageSelectors.title,
                    workerComplaintsPageSelectors.contactPerson,
                    workerComplaintsPageSelectors.companyName,
                    workerComplaintsPageSelectors.date
                ]);
            }
        });

        await test.step("Step 2: Verify scroll to load function", async () => {
            // Step 2.1: Scroll and validate new items are loaded
            const updatedVisibleItemCount = await scrollAndValidateLoadMore(
                page,
                workerComplaintsPageSelectors.itemCount,
                workerComplaintsPageSelectors.workerComplaintItem,
                workerComplaintsPageSelectors.workerComplaintSkeletonItem,
            );
        });

        await test.step("Step 3: Verify sorting items function", async () => {
            // Step 3.1: Verify default Date Descending sorting before any interaction
            await validateItemDisplayOrder(
                page,
                workerComplaintsPageSelectors.workerComplaintItem,
                workerComplaintsPageSelectors.date,
                "desc"
            );

            // Step 3.2: Toggle sorting dialog and change to ascending order
            await toggleAndSetDisplayOrder(
                page,
                workerComplaintsPageSelectors.workerComplaintItem,
                workerComplaintsPageSelectors.date,
                "desc",
                "asc"
            );

            // Step 3.3 Verify items sorted in ascending order
            await validateItemDisplayOrder(
                page,
                workerComplaintsPageSelectors.workerComplaintItem,
                workerComplaintsPageSelectors.date,
                "asc"
            );
        });

        // Variables to store the total number of Profiles cards from Company(client) filter (step 4)
        let parentFilterTotalItems = 0;
        let selectedClientFilterText = "";
        let selectedStatusFilterText = "";

        await test.step("Step 4: Verify filtering Worker Complaints based on Client Company", async () => {
            const results = await applySingleCompanyFilterAndVerify(page, "WOrker Complaints");

            if (results && results.companyTotalItems > 0) {
                selectedClientFilterText = results.companyName;
                parentFilterTotalItems = results.companyTotalItems;
            };
        });

        await test.step("Step 5: Verify filtering Worker Complaints based on Status", async ()=> {
            const results = await applyStatusFilterAndVerify(page, parentFilterTotalItems, selectedClientFilterText);
            if (!results) return;

            selectedStatusFilterText = results.selectedStatuses.join(", ");

            const sortText = await page.locator(dialogSort.sortText).innerText();
            const match = /^\d+/.exec(sortText);
            const sortNumber = parseInt(match?.[0] ?? "0", 10);
            expect(sortNumber).toBe(results?.totalSelectedItems);
        });

        await test.step("Step 6: Verify Search function", async () => {
            await verifySearchFunction({
                page,
                searchInput: page.locator(searchFilter.inputField),
                headerTitle: page.locator(workerComplaintsPageSelectors.headerTitle),
                resultCardsLocator: page.locator(workerComplaintsPageSelectors.companyName),
                clientFilterTextLocator: page.locator(searchFilter.clientFilterText),
                emptyMessageLocator: page.locator(searchFilter.emptyFilterMessage),
                emptyResetButtonLocator: page.locator(searchFilter.emptyFilterResetButton),
                selectedClientFilterText,
                i18n,
            });
        });
    });
});