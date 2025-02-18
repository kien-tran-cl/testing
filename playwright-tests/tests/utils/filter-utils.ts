import { Page, expect } from "playwright/test";
import { dialogSort, searchFilter } from "./selectors";

/**
 * Apply a single company filter and verify the results.
 * @param page Playwright page object
 * @param pageType The name of the company to filter
 */

export async function applySingleCompanyFilterAndVerify(
    page: Page,
    pageType: string,
) {
    // Open Company filter dropdown
    await page.click(searchFilter.clientFilter);
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "visible" });
    await page.waitForSelector(searchFilter.filterOptions, { state: "visible" });

    // Find all available companies
    const countElements = await page.locator(searchFilter.companyFilterCount);
    const labelElements = await page.locator(searchFilter.companyFilterLabel);

    const itemCount = await countElements.count();
    console.log(`🔍 Found ${itemCount} companies in the filter dropdown.`);

    let companyTotalItems = 0;
    let companyName = "";
    let maxIndex = -1;

    for (let i = 1; i < itemCount; i++) {
        const numberText = await countElements.nth(i).innerText();
        const number = parseInt(numberText.trim(), 10);
        const text = await labelElements.nth(i).innerText();

        console.log(`➡️ Checking company: ${text} with ${number} items.`);

        if (!isNaN(number) && number > companyTotalItems) {
            companyTotalItems = number;
            companyName = text;
            maxIndex = i;
        }
    }

    // Click on the company containing the most items
    if (companyTotalItems > 0 && maxIndex >= 0) {
        console.log(`✅ Selecting company: ${companyName} with ${companyTotalItems} items.`);
        await labelElements.nth(maxIndex).click();
    } else {
        console.log("❌ No valid company found to apply filter.");
        return; // Exit test early if no valid item found
    }

    await page.waitForTimeout(3000);

    // Verify the filter form automatically closes
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "hidden" });


    // Verify companyName is displayed on the search bar
    const clientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
    expect(clientFilterText.trim()).toBe(companyName.trim());
    console.log(`🔎 Verified: Filter applied correctly for ${companyName}.`);

    // Verify number of items on page matches companyTotalItems
    const sortText = await page.locator(dialogSort.sortText).innerText();
    const sortNumber = parseInt(sortText.match(/^\d+/)?.[0] || "0", 10);
    expect(sortNumber).toBe(companyTotalItems);
    console.log(`📊 Verified: Page displays ${sortNumber} items, matching the expected ${companyTotalItems}.`);


    console.log(`✅ [${pageType}] Filter applied successfully for company: ${companyName}`);
    return { companyTotalItems, companyName };
}