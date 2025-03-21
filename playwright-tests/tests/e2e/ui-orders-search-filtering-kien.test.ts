import { expect } from "playwright/test";
import { test } from "../base";
import { activitiesSelectors, dialogSort, inquiriesPageSelectors, ordersPageSelectors, searchFilter } from "../utils/selectors";
import { appUrl } from "../utils/auth-utils";
import { scrollAndValidateLoadMore, validateVisibleItems, verifyFirstItemComponents } from "../utils/pageListing-utils";
import { toggleAndSetDisplayOrder, validateItemDisplayOrder } from "../utils/sorting-utils";
import { applySingleCompanyFilterAndVerify, applyStatusFilterAndVerify } from "../utils/filter-utils";

test.use ({ storageState: "./LoginAuth.json" });
test.describe("E2E - Orders Search & Filtering", () => {
    test.describe.configure({
        timeout: 90000,
        mode: "serial",
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrl());
        await page.locator(activitiesSelectors.ordersCard).click();
        await expect(page).toHaveURL(appUrl("/activities/orders/list"));
        await page.waitForLoadState("networkidle");
    });

    test("Verify Order Search & Filter", async ({ page, i18n }) => {
        await test.step("Step 1: Verify Orders page components", async () => {
            // Step 1.1: Verify the default number of visible items are between 1-20
            const visibleItemCount = await validateVisibleItems (
                page,
                ordersPageSelectors.ordersItem,
                ordersPageSelectors.ordersSkeletonItem,
            );

            // Step 1.2: Verify components inside the first card
            if (visibleItemCount > 0) {
                const firstCard = page.locator(ordersPageSelectors.ordersItem).nth(2);

                await verifyFirstItemComponents(firstCard, [
                    ordersPageSelectors.status,
                    ordersPageSelectors.workerName,
                    ordersPageSelectors.occupation,
                    ordersPageSelectors.maximumLoanPeriod,
                    ordersPageSelectors.equalPayDate,
                    ordersPageSelectors.companyName,
                    ordersPageSelectors.date
                ]);
            }
        });

        await test.step("Step 2: Verify scroll to load function", async () => {
            // Step 2.1: Scroll and validate new items are loaded
            const updatedVisibleItemCount = await scrollAndValidateLoadMore(
                page,
                ordersPageSelectors.itemCount,
                ordersPageSelectors.ordersItem,
                ordersPageSelectors.ordersSkeletonItem,
            );
        });

        await test.step("Step 3: Verify Sorting items functions", async () => {
            // Step 3.1: Verify default Date Descending sorting before any interaction
            await validateItemDisplayOrder(
                page,
                ordersPageSelectors.ordersItem,
                ordersPageSelectors.date,
                "desc",
            );

            // Step 3.2: Toggle sorting dialog and change to ascending order
            await toggleAndSetDisplayOrder(
                page,
                ordersPageSelectors.ordersItem,
                ordersPageSelectors.date,
                "desc",
                "asc",
            );

            // Step 3.3: Verify items are sorted in ascending order
            await validateItemDisplayOrder(
                page,
                ordersPageSelectors.ordersItem,
                ordersPageSelectors.date,
                "asc",
            );
        });

        // Variables to store the total number of Orders cards from Company(client) filter (step 4)
        let parentFilterTotalItems = 0; 
        let selectedClientFilterText = ""; // Declare it globally to reuse in later steps
        let selectedStatusFilterText = ""; // Declare it globally to reuse in later steps

        await test.step("Step 4: Verify filtering Orders based on Client Company", async () => {
            const results = await applySingleCompanyFilterAndVerify(page, "Orders");

            if (results && results.companyTotalItems > 0) {
                selectedClientFilterText = results.companyName;
                parentFilterTotalItems = results.companyTotalItems; 
            }
        });

        await test.step("Step 5: Verify filtering Orders based on Status", async () => {
            const results = await applyStatusFilterAndVerify(page, parentFilterTotalItems, selectedClientFilterText);
            if (!results) return;

            selectedStatusFilterText = results.selectedStatuses.join(", ");

            const sortText = await page.locator(dialogSort.sortText).innerText();
            const match = /^\d+/.exec(sortText);
            const sortNumber = parseInt(match?.[0] ?? "0", 10);
            expect(sortNumber).toBe(results.totalSelectedItems);
        });

        await test.step("Step 6: Verify filtering Orders based on Occupations", async () => {
            // Click on the All occupations
            const multiselectFilter = page.locator(searchFilter.multiselectFilter);
            await multiselectFilter.nth(2).click();

            // -> Verify Occupations filter displayed, and included at least 1 occupation to filter
            await page.waitForSelector(searchFilter.filterOptions, {
                state: "visible",
            });

            // Find in the list and Select the first filter option that has 0 item
            // Get the list of numbers (item counts) and corresponding company names
            const numberElements = await page.locator(
                `${searchFilter.filterOptions} div.grid p`,
            ); // Locator for item count
            const textElements = await page.locator(
                `${searchFilter.filterOptions} > p`,
            ); // Locator for company name

            const itemCount = await numberElements.count();
            let zeroItemIndex = -1;

            for (let i = 1; i < itemCount; i++) {
                const numberText = await numberElements.nth(i).innerText();
                const number = parseInt(numberText.trim(), 10); // Convert text to number

                if (number === 0) {
                    zeroItemIndex = i; // Store the index of the first company with 0 items
                    break; // Exit the loop as soon as we fin the First match
                }
            }

            let selectedQualificationText = "";

            if (zeroItemIndex >=0) {
                // Get the name of the company with 0 items (optional, for logging purposes)
                const companyName = await textElements.nth(zeroItemIndex).innerText();

                selectedQualificationText = companyName;

                // Click on the company with 0 items
                const zeroItemCompany = page.locator(
                    `${searchFilter.filterOptions} >> nth=${zeroItemIndex}`,
                );
                await zeroItemCompany.click();
            } else {
                console.error("No company with 0 items was found in the filter.");
            }

            // -> Verify the form will be hidden after user confirmation - by clicking on 'Done' button
            await page.locator(searchFilter.closeFilter).click();
            await page.waitForTimeout(3000);
            await page.waitForSelector(searchFilter.filterFormOverlay, {
                state: "hidden",
            });

            // -> Verify companyName is displaying on the right side of the search bar
            const currentClientFilterText = await page
              .locator(searchFilter.clientFilterText)
              .innerText();
            
            if (currentClientFilterText.trim() === selectedClientFilterText) {
            } else {
                console.error(
                    "Error: The client filter text does not match the value selected in Step 4.",
                );
            }

            // -> Verify the selected status are shown separated by comma in the status filter button
            const currentStatusFilterText = await page
              .locator(`${searchFilter.multiselectFilter} >> nth=1`)
              .innerText();

            if (currentStatusFilterText.trim() === selectedStatusFilterText) {
            } else {
                console.error(
                    "Error: The dropdown text does not match the value selected in Step 5.",
                );
                console.error(`Expected: "${selectedStatusFilterText}", but found "${currentStatusFilterText}"`);
            }

            // -> Verify the selected qualification is shown in the qualification filter button (active state)
            const currentQualificationFilterText = await page
              .locator(searchFilter.multiselectFilter)
              .nth(2)
              .innerText();

            if (
              currentQualificationFilterText.trim() === 
              selectedQualificationText.trim()
            ) {
            } else {
              console.error(
                  "Error: The qualification filter button does not  match the selected qualification.",
              );
              console.error(
                  `Expected: "${selectedQualificationText.trim()}", but found ""${currentQualificationFilterText.trim()}`,
              );
            }

            // -> Verify a warning message is displayed
            const warningMessage = page.locator(searchFilter.emptyFilterMessage);
            await expect(warningMessage).toBeVisible();
            expect(warningMessage).toHaveText(i18n.t("common.emptyFilter.desc"));
              
        });

        await test.step("Step 7: Verify Reset Filters function", async () => {
            // Click on Reset filters button
            await page.locator(searchFilter.emptyFilterResetButton).click();

            // -> Verify all filter options are in inactive state and hidden
            await page.waitForSelector(`${searchFilter.multiselectFilter} >> nth=1`, {
                state: "hidden",
            });
            await page.waitForSelector(`${searchFilter.multiselectFilter} >> nth=2`, {
                state: "hidden",
            });

            // -> Verify the list is not empty
            await page.waitForSelector(inquiriesPageSelectors.inquiriesItem, {
                state: "visible",
            });
        });

        await test.step("Step 8: Verify Search function", async () => {
            const positiveSearch = "GMBH";
            const negativeSearch = "abcxyz";
            const searchInput = page.locator(searchFilter.inputField);
      
            // Use 'GMBH' as search term (Positive search)
            await searchInput.fill(positiveSearch);
            await page.waitForTimeout(2000);
      
            // -> Verify the list shows results that match the search term. (results related to GMBH display on page)
            // Wait for search result to load
            const searchResultInquiriesCards = page.locator(
              inquiriesPageSelectors.companyNameAndCity,
            );
            const searchReusultsCount = await searchResultInquiriesCards.count();
            expect(searchReusultsCount).toBeGreaterThan(0);
      
            // Check if at least one result contains the search keyword
            let matchFound = false;
      
            for (let i = 0; i < searchReusultsCount; i++) {
              const card = searchResultInquiriesCards.nth(i);
              const cardContent = await card.textContent();
      
              // If a match if found, stop further checks
              if (cardContent?.toLowerCase().includes(positiveSearch.toLowerCase())) {
                matchFound = true;
                break;
              }
            }
      
            expect(matchFound).toBeTruthy();
      
            // Use 'abcxyz' as search term (Negative search)
            await searchInput.fill(negativeSearch);
      
            // -> Verify no result related to 'abcxyz' found
            await page.waitForTimeout(2000);
            expect(searchResultInquiriesCards).toBeHidden();
      
            await page.waitForSelector(searchFilter.emptyFilterMessage, {
              state: "visible",
            });
        });

        await test.step("Step 9: Verify removing search term function", async () => {
            const searchInput = page.locator(searchFilter.inputField);
            await expect(searchInput).toHaveValue("abcxyz");
      
            // Click on the 'X' in the search bar
            await page.locator(searchFilter.clearInputField).click();
      
            // -> Verify search bar is empty
            await expect(searchInput).toHaveValue("");
      
            // -> Verify the list show unfiltered results
            await page.waitForSelector(inquiriesPageSelectors.inquiriesItem, {
              state: "visible",
            });
        });
    });
});