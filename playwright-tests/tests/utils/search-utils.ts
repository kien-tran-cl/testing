import { Page, Locator, expect } from "@playwright/test";
import { debugLog } from "./debug-utils";

/**
 * Performs a search and verifies results for both valid and invalid search terms.
 *
 * @param {Object} params - Search function parameters.
 * @param {Page} params.page - Playwright's Page object.
 * @param {Locator} params.searchInput - The search input field locator.
 * @param {Locator} params.headerTitle - The locator for the page's header title.
 * @param {Locator} params.resultCardsLocator - Locator for search result items.
 * @param {Locator} params.clientFilterTextLocator - Locator for the selected company name next to the search bar.
 * @param {Locator} params.emptyMessageLocator - Locator for the empty search result message.
 * @param {Locator} params.emptyResetButtonLocator - Locator for the reset button when no results are found.
 * @param {string} params.selectedClientFilterText - The expected text of the selected company filter.
 * @param {any} params.i18n - i18n instance injected from the test context.
 */
export async function verifySearchFunction({
    page,
    searchInput,
    headerTitle,
    resultCardsLocator,
    clientFilterTextLocator,
    emptyMessageLocator,
    emptyResetButtonLocator,
    selectedClientFilterText,
    i18n,
}: {
    page: Page;
    searchInput: Locator;
    headerTitle: Locator;
    resultCardsLocator: Locator;
    clientFilterTextLocator: Locator;
    emptyMessageLocator: Locator;
    emptyResetButtonLocator: Locator;
    selectedClientFilterText: string;
    i18n: any;
}) {
    const positiveSearch = "GEDAT";
    const negativeSearch = "abcxyz";

    debugLog("Starting search verification...");

    // 🔍 Perform search with a valid keyword
    debugLog(`Filling search input with: ${positiveSearch}`);
    await searchInput.fill(positiveSearch);
    await headerTitle.click(); // Click outside the search box to ensure the input is registered
    await page.waitForTimeout(2000); // Wait for search results to load

    // ✅ Verify that results are displayed
    const searchResultsCount = await resultCardsLocator.count();
    const currentClientFilterText = await clientFilterTextLocator.innerText();

    debugLog(`Current client filter text: ${currentClientFilterText}`);
    debugLog(`Number of search results found: ${searchResultsCount}`);

    expect(currentClientFilterText.trim()).toBe(selectedClientFilterText.trim()); // Ensure selected company remains the same
    expect(searchResultsCount).toBeGreaterThan(0); // Expect at least one result

    // 🔎 Check if at least one result contains the search keyword
    let matchFound = false;
    for (let i = 0; i < searchResultsCount; i++) {
        const cardContent = await resultCardsLocator.nth(i).textContent();
        debugLog(`Checking result ${i}: ${cardContent?.trim()}`);

        if (cardContent?.toLowerCase().includes(positiveSearch.toLowerCase())) {
            matchFound = true;
            debugLog("Match found in search results!");
            break;
        }
    }
    expect(matchFound).toBeTruthy(); // Ensure search results contain the keyword

    // ❌ Perform search with an invalid keyword
    debugLog(`Filling search input with: ${negativeSearch}`);
    await searchInput.fill(negativeSearch);
    await page.waitForTimeout(2000);
    await headerTitle.click();

    // 🛑 Verify that no results are displayed
    debugLog("Verifying no results are found...");
    expect(resultCardsLocator).toBeHidden();
    const newClientFilterText = await clientFilterTextLocator.innerText();

    debugLog(`New client filter text: ${newClientFilterText}`);
    expect(newClientFilterText.trim()).toBe(selectedClientFilterText.trim()); // Ensure selected company remains the same
    
    // ✅ Validate empty state messages
    await expect(emptyMessageLocator).toHaveText(i18n.t("common.emptyFilter.desc")); // Validate empty state message
    await expect(emptyResetButtonLocator).toHaveText(i18n.t("common.emptyFilter.button")); // Validate reset button text
    debugLog("Search verification completed successfully.");
}