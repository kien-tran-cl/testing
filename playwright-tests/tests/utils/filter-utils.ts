import { Page, expect } from "playwright/test";
import { dialogSort, searchFilter } from "./selectors";
import { debuglog } from "util";

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

/**
 * Apply a status filter and verify the results.
 * @param page Playwright page object
 * @param parentFilterTotalItems (A) The number of items after filtering by Company
 * @param selectedClientFilterText The name of the company selected in the previous step
 */
export async function applyStatusFilterAndVerify(page: Page, parentFilterTotalItems: number, selectedClientFilterText: string) {
    // Click on the search input to open the filter list
    await page.locator(searchFilter.inputField).click();

    // Determine the number of filter options (the page may have 1 or 2 filters)
    const multiselectFilter = page.locator(searchFilter.multiselectFilter);
    const count = await multiselectFilter.count();
    expect(count).toBeGreaterThan(0);

    // Click on the first option (which is the Status filter)
    await multiselectFilter.nth(0).click();

    // Wait for the filter form to appear
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "visible" });
    await page.waitForSelector(searchFilter.filterOptions, { state: "visible" });

    // Retrieve the list of available statuses
    const countElements = page.locator(searchFilter.statusFilterCount);
    const labelElements = page.locator(searchFilter.statusFilterLabel);

    const itemCount = await countElements.count();
    let selectedStatuses: string[] = [];
    let totalSelectedItems = 0;
    let maxIndex = -1;
    let secondIndex = -1;

    let maxItems = 0;
    let secondItems = 0;

    for (let i = 1; i < itemCount; i++) {
        const numberText = await countElements.nth(i).innerText();
        const number = parseInt(numberText.trim(), 10);

        if (!isNaN(number)) {
            if (number > maxItems) {
                secondItems = maxItems;
                secondIndex = maxIndex;

                maxItems = number;
                maxIndex = i;
            } else if (number > secondItems) {
                secondItems = number;
                secondIndex = i;
            }
        }
    }

    debuglog(`🔹 Selected Status 1: ${maxItems} items (index: ${maxIndex})`);
    debuglog(`🔹 Selected Status 2: ${secondItems} items (index: ${secondIndex})`);

    // Click on the status with the highest number of items
    if (maxItems > 0 && maxIndex >= 0) {
        const statusText = await labelElements.nth(maxIndex).innerText(); // Store in a variable first
        selectedStatuses.push(statusText);
        await labelElements.nth(maxIndex).click();
        totalSelectedItems += maxItems;
    } else {
        debuglog("❌ No valid status found to apply filter.");
        return null;
    }

    // Select a second status (if available)
    if (secondItems > 0 && secondIndex >= 0) {
        const statusText = await labelElements.nth(secondIndex).innerText(); // Store in a variable first
        selectedStatuses.push(statusText);
        await labelElements.nth(secondIndex).click();
        totalSelectedItems += secondItems;
    }

    await page.waitForTimeout(1000);

    // Close the filter form
    await page.locator(searchFilter.closeFilter).click();
    await page.waitForTimeout(3000);
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "hidden" });

    // ✅ **1: Verify that the company name is still displayed correctly**
    const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
    expect(currentClientFilterText.trim()).toBe(selectedClientFilterText.trim());

    debuglog(`✅ Company name after applying Status filter: ${currentClientFilterText}`);

    // ✅ **2: Verify the dropdown displays both selected statuses correctly**
    const selectedStatusFilterText = await page.locator(`${searchFilter.multiselectFilter} >> nth=1`).innerText();
    const selectedDropdownItems = selectedStatusFilterText.split(",").map(item => item.trim());

    expect(selectedDropdownItems).toEqual(expect.arrayContaining(selectedStatuses));

    debuglog(`✅ Dropdown displays: ${selectedDropdownItems.join(", ")}`);
    debuglog(`✅ Selected statuses: ${selectedStatuses.join(", ")}`);

    // ✅ **3: Verify that the number of Status filter results (C) is not greater than the Company filter results (A)**
    expect(totalSelectedItems).toBeLessThanOrEqual(parentFilterTotalItems);

    debuglog(`✅ Status filter results (C = ${totalSelectedItems}) <= Company filter results (A = ${parentFilterTotalItems})`);

    // ✅ **4: Verify that the number of displayed items is correct**
    const sortText = await page.locator(dialogSort.sortText).innerText();
    const match = /^\d+/.exec(sortText);
    const sortNumber = parseInt(match?.[0] ?? "0", 10);

    expect(sortNumber).toBe(totalSelectedItems);

    return { totalSelectedItems, selectedStatuses };
}

/**
 * Apply a occupation filter and verify the results.
 * @param page Playwright page object
 * @param parentFilterTotalItems (A) The number of items after filtering by Company
 * @param selectedClientFilterText The name of the company selected in the previous step
 */
export async function applyOccupationFilterAndVerify(page: Page, parentFilterTotalItems: number, selectedClientFilterText: string) {
    // Click on the search input to open the filter list
    await page.locator(searchFilter.inputField).click();

    // Determine the number of filter options (the page may have 1 or 2 filters)
    const multiselectFilter = page.locator(searchFilter.multiselectFilter);
    const count = await multiselectFilter.count();
    expect(count).toBeGreaterThan(0);

    // Click on the first option (which is the Status filter)
    await multiselectFilter.nth(1).click();

    // Wait for the filter form to appear
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "visible" });
    await page.waitForSelector(searchFilter.filterOptions, { state: "visible" });

    // Retrieve the list of available statuses
    const countElements = page.locator(searchFilter.statusFilterCount);
    const labelElements = page.locator(searchFilter.statusFilterLabel);

    const itemCount = await countElements.count();
    let selectedStatuses: string[] = [];
    let totalSelectedItems = 0;
    let maxIndex = -1;
    let secondIndex = -1;

    let maxItems = 0;
    let secondItems = 0;

    for (let i = 1; i < itemCount; i++) {
        const numberText = await countElements.nth(i).innerText();
        const number = parseInt(numberText.trim(), 10);

        if (!isNaN(number)) {
            if (number > maxItems) {
                secondItems = maxItems;
                secondIndex = maxIndex;

                maxItems = number;
                maxIndex = i;
            } else if (number > secondItems) {
                secondItems = number;
                secondIndex = i;
            }
        }
    }

    debuglog(`🔹 Selected Status 1: ${maxItems} items (index: ${maxIndex})`);
    debuglog(`🔹 Selected Status 2: ${secondItems} items (index: ${secondIndex})`);

    // Click on the status with the highest number of items
    if (maxItems > 0 && maxIndex >= 0) {
        const statusText = await labelElements.nth(maxIndex).innerText(); // Store in a variable first
        selectedStatuses.push(statusText);
        await labelElements.nth(maxIndex).click();
        totalSelectedItems += maxItems;
    } else {
        debuglog("❌ No valid status found to apply filter.");
        return null;
    }

    // Select a second status (if available)
    if (secondItems > 0 && secondIndex >= 0) {
        const statusText = await labelElements.nth(secondIndex).innerText(); // Store in a variable first
        selectedStatuses.push(statusText);
        await labelElements.nth(secondIndex).click();
        totalSelectedItems += secondItems;
    }

    await page.waitForTimeout(1000);

    // Close the filter form
    await page.locator(searchFilter.closeFilter).click();
    await page.waitForTimeout(3000);
    await page.waitForSelector(searchFilter.filterFormOverlay, { state: "hidden" });

    // ✅ **1: Verify that the company name is still displayed correctly**
    const currentClientFilterText = await page.locator(searchFilter.clientFilterText).innerText();
    expect(currentClientFilterText.trim()).toBe(selectedClientFilterText.trim());

    debuglog(`✅ Company name after applying Status filter: ${currentClientFilterText}`);

    // ✅ **2: Verify the dropdown displays both selected statuses correctly**
    const selectedStatusFilterText = await page.locator(`${searchFilter.multiselectFilter} >> nth=2`).innerText();
    const selectedDropdownItems = selectedStatusFilterText.split(",").map(item => item.trim());

    expect(selectedDropdownItems).toEqual(expect.arrayContaining(selectedStatuses));

    debuglog(`✅ Dropdown displays: ${selectedDropdownItems.join(", ")}`);
    debuglog(`✅ Selected statuses: ${selectedStatuses.join(", ")}`);

    // ✅ **3: Verify that the number of Status filter results (C) is not greater than the Company filter results (A)**
    expect(totalSelectedItems).toBeLessThanOrEqual(parentFilterTotalItems);

    debuglog(`✅ Status filter results (C = ${totalSelectedItems}) <= Company filter results (A = ${parentFilterTotalItems})`);

    // ✅ **4: Verify that the number of displayed items is correct**
    const sortText = await page.locator(dialogSort.sortText).innerText();
    const match = /^\d+/.exec(sortText);
    const sortNumber = parseInt(match?.[0] ?? "0", 10);

    expect(sortNumber).toBe(totalSelectedItems);

    return { totalSelectedItems, selectedStatuses };
}