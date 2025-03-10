import { expect } from "playwright/test";
import { test } from "../base";
import { loginBeforeTest } from "../common";
import { activitiesSelectors, dialogSort, salesActivitiesPageSelectors, searchFilter } from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";
import { scrollAndValidateLoadMore, validateVisibleItems, verifyFirstItemComponents } from "../utils/pageListing-utils";
import { toggleAndSetDisplayOrder, validateItemDisplayOrder } from "../utils/sorting-utils";
import { applySingleCompanyFilterAndVerify } from "../utils/filter-utils";

test.describe("E2E - Sales Activities Search & Filtering", () => {
    test.describe.configure({
        timeout: 90000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await loginBeforeTest(page);
        await page.locator(activitiesSelectors.salesActivitiesCard).click();
        await expect(page).toHaveURL(appUrl("/activities/sales-activities/list"));
        await page.waitForLoadState("networkidle");
    });

    test("Verify Sales Activities & Filter", async ({ page, i18n }) => {
        await test.step("Step 1: Verify Sales Activities page components", async () => {
            // Step 1: Verify the default number of visible items are between 1-20
            const visibleItemCount = await validateVisibleItems (
                page,
                salesActivitiesPageSelectors.salesActivitiesItem,
                salesActivitiesPageSelectors.salesActivitiesSkeletonItem
            );

            // Step 2: Verify components inside the first card
            if (visibleItemCount > 0) {
                const firstCard = page.locator(salesActivitiesPageSelectors.salesActivitiesItem).nth(0);

                await verifyFirstItemComponents(firstCard, [
                    salesActivitiesPageSelectors.status,
                    salesActivitiesPageSelectors.title,
                    salesActivitiesPageSelectors.contactPerson,
                    salesActivitiesPageSelectors.companyName,
                    salesActivitiesPageSelectors.date
                ], salesActivitiesPageSelectors.salesActivitiesSkeletonItem);
            };
        });

        await test.step("Step 2: Verify scroll to load function", async () => {
            // Scroll and validate new items are loaded
            const updatedVisibleItemCount = await scrollAndValidateLoadMore(
                page,
                salesActivitiesPageSelectors.itemcount,
                salesActivitiesPageSelectors.salesActivitiesItem,
                salesActivitiesPageSelectors.salesActivitiesSkeletonItem,
            );
        });

        await test.step("Step 3: Verify Sorting items function", async () => {
            // Step 1: Verify default Date Descending sorting before any interaction
            await validateItemDisplayOrder(
                page,
                salesActivitiesPageSelectors.salesActivitiesItem,
                salesActivitiesPageSelectors.date,
                "desc",
            );

            // Step 2: Toggle sorting dialog and change to ascending order
            await toggleAndSetDisplayOrder(
                page,
                salesActivitiesPageSelectors.salesActivitiesItem,
                salesActivitiesPageSelectors.date,
                "desc",
                "asc",
            );

            // Step 3: Verify items are sorted in ascending order
            await validateItemDisplayOrder(
                page,
                salesActivitiesPageSelectors.salesActivitiesItem,
                salesActivitiesPageSelectors.date,
                "asc",
            );
        });

        // Variables to store the total number of Sales Activities cards from Company(Client) filter (step 4)
        let parentFilterTotalItems = 0;
        let selectedClientFilterText = ""; // Declare it globally to reuse in later steps
        let selectedStatusFilterText = ""; // Declare it globally to reuse in later steps
        
        await test.step("Step 4: Verify filtering Sales Activities based on Client Company", async () => {
            const results = await applySingleCompanyFilterAndVerify(page, "Sales Activities");

            if (results && results.companyTotalItems > 0) {
                selectedClientFilterText = results.companyName;
                parentFilterTotalItems = results.companyTotalItems;
            }
        });

        await test.step("Step 5: Verify filtering Sales Activities based on Status", async ()=> {
            // Click on the Search bar then verify there is 1 filter option - then click on that option 'all status'
            await page.locator(searchFilter.inputField).click();

            const multiselectFilter = page.locator(searchFilter.multiselectFilter);

            const count = await multiselectFilter.count();
            expect(count).toBe(1);

            for (let i = 0; i < count; i++) {
                await expect(multiselectFilter.nth(i)).toBeVisible();
            };

            await multiselectFilter.nth(0).click();

            // -> Verify status filter displayed and included at least 1 status to filter
            await page.waitForSelector(searchFilter.filterFormOverlay, {
                state: "visible",
            });
            await page.waitForSelector(searchFilter.filterOptions, {
                state: "visible",
            });

            // Find in the list and focus on the first status that has item >=1 then capture the number and call it C, also capture status name and call it D -> then click on Done
            const numberElements = await page.locator(
                `${searchFilter.filterOptions} div.grid p`,
            ); // Locator for the number part - which is C
            const textElements = await page.locator(
                `${searchFilter.filterOptions} p.break-all`,
            ); // Locator for the text part - which is D

            const numbers: number[] = [];
            const texts: string[] = [];
            const itemCount = await numberElements.count();

            let companyTotalItems = 0; // Number of Items in the status with the most items in the list
            let companyName = ""; // Name of the corresponding status with the most items in the list
            let maxIndex = -1;

            for (let i = 1; i < itemCount; i++) {
                const numberText = await numberElements.nth(i).innerText();
                const number = parseInt(numberText.trim(), 10); // Get the Items in the status
                const text = await textElements.nth(i).innerText(); // Get the status name

                if (!isNaN(number)) {
                    numbers.push(number);
                    texts.push(text);
                    if (number > companyTotalItems) {
                        companyTotalItems = number; // Update the maximum Items
                        companyName = text; // Update the corresponding company name
                        maxIndex = i; // Save the index of the maximum Items
                    }
                }
            };

            // Click on the company containing the most items
            if (companyTotalItems > 0 && maxIndex >= 0) {
                const itemWithMaxNumber = page.locator(
                    `${searchFilter.filterOptions} >> nth=${maxIndex}`,
                );
                await itemWithMaxNumber.click();
            } else {
                console.log("No valid item with a number greater than 0 to click.");
                return; // Exit the test early if no valid item found
            }

            // -> Select an additional status above or below the current selection
            if (maxIndex > 1) {
                // If not the first row, select the satus above
                const itemAbove = page.locator(
                    `${searchFilter.filterOptions} >> nth=${maxIndex - 1}`,
                );
                await itemAbove.click();
            } else if (maxIndex === 1 && itemCount > 2) {
                // If the first row, select the status below (if available)
                const itemBelow = page.locator(
                    `${searchFilter.filterOptions} >> nth=${maxIndex + 1}`,
                );
                await itemBelow.click();
            } else {
                console.warn("No other status option to select.")
            }

            await page.waitForTimeout(1000);

            // -> Verify the filter is multi selection form - will still visible after selected item
            await page.waitForSelector(searchFilter.filterFormOverlay, {
                state: "visible",
            });
            
            // -> Verify the form will be hidden after user confirmation - by clicking on 'Done' button
            await page.locator(searchFilter.closeFilter).click();
            await page.waitForTimeout(3000);
            await page.waitForSelector(searchFilter.filterFormOverlay, {
                state: "hidden",
            });

            // -> Verify companyName is displaying on the right side of the search bar
            const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();

            if (currentClientFilterText.trim() === selectedClientFilterText) {
            } else {
                console.error(
                    "Error: The client filter text does not match the value selected in Step 4.",
                );
            }

            // Verify the dropdown is now displaying the selected status
            const multiselectFilterText = await page.locator(`${searchFilter.multiselectFilter} >> nth=1`).innerText();

            // Process and store the dropdown text
            const selectedItems = multiselectFilterText.split(",").map((item) => item.trim()); // Split into selected items

            if (selectedItems.includes(companyName)) {
                selectedStatusFilterText = multiselectFilterText.trim(); // Save the entire dropdown globally
            } else {
                console.error(
                    "Error: Dropdown text does not contain the selected company name.",
                );
            }

            // -> Verify count of C <= A in the company filter
            if (companyTotalItems <= parentFilterTotalItems) {
            } else {
                console.log(
                    `Error: Total items in status filter (C = ${companyTotalItems}) is greater than total items in company filter (A = ${parentFilterTotalItems}).`,
                );
            }

            // -> Verify number of Sales Activities card displaying on page = C
            const sortText = await page.locator(dialogSort.sortText).innerText();
            const sortNumber = parseInt(sortText.match(/^\d+/)?.[0] || "0", 10); // Extract number from text (e.g., "13 Anfragen" -> 13)
            if (sortNumber === companyTotalItems) {
            } else {
                console.error(
                    "Error: Number of inquiries does not match the selected company's count.",
                );
            }
        });

        await test.step("Step 6: Verify search function", async () => {
            const negativeSearch = "abcxyz";
            const searchInput = page.locator(searchFilter.inputField);
            const searchResultSalesActivitiesCards = page.locator(salesActivitiesPageSelectors.companyName);

            // use 'abcxyz' as search term (Negative search)
            await searchInput.fill(negativeSearch);
            await page.waitForTimeout(2000);
            await page.keyboard.press('Tab');

            // -> Verify no result related to 'abcxyz' found
            expect(searchResultSalesActivitiesCards).toBeHidden();

            // -> Verify companyName is displaying on the right side of the search bar
            const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();

            if (currentClientFilterText.trim() === selectedClientFilterText) {
            } else {
                console.error(
                    "Error: The client filter text does not match the value selected in Step 4.",
                );
            }

            // -> Verify warning message display
            expect(page.locator(searchFilter.emptyFilterMessage)).toBeVisible();

            // -> Verify reset filter button display
            expect(page.locator(searchFilter.emptyFilterResetButton)).toBeVisible();
        });

        await test.step("step 7: Verify Cancel search function", async () => {
            const searchInput = page.locator(searchFilter.inputField);
            expect (searchInput).toHaveValue("abcxyz");

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
            await page.waitForSelector(salesActivitiesPageSelectors.salesActivitiesItem, {
                state: "visible",
            });
        });
    });
});