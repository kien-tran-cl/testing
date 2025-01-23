import { Page, expect } from "@playwright/test";
import { dialogSort } from "./selectors"; 

/**
 * Validate the display order of items based on dates.
 * @param page - The Playwright page object
 * @param itemSelector - Selector for list items
 * @param dateSelector - Selector for date fields inside the list items
 * @param order - Sorting order to validate ('asc' | 'desc')
 */
export async function validateItemDisplayOrder(
    page: Page,
    itemSelector: string,
    dateSelector: string,
    order: 'asc' | 'desc'
): Promise<void> {
    const items = await page.locator(itemSelector);
    const dates: Date[] = [];

    const itemCount = await items.count();
    for (let i = 0; i < itemCount; i++) {
        const dateValue = await items.nth(i).locator(dateSelector).innerText();
        if (dateValue.trim()) {
            const [month, day, year] = dateValue.split("/");
            const parsedDate = new Date(`${year}-${month}-${day}`);
            dates.push(parsedDate);
        }
    };

    const sortedDates = [...dates].sort((a, b) =>
        order === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime()
    );

        console.log(`Sorted Dates (${order}):`, sortedDates);

    // Verify that the dates array matches the sorted array
    expect(dates).toEqual(sortedDates);
}

/**
 * Utility function to toggle and set the display order in a list.
 * @param page - The Playwright page object
 * @param itemSelector - The selector for the list items to be sorted
 * @param dateSelector - The selector for the date field within the items
 * @param initialOrder - The expected initial order ('asc' | 'desc')
 * @param newOrder - The desired new order to apply ('asc' | 'desc')
 */
export async function toggleAndSetDisplayOrder(
    page: Page,
    itemSelector: string,
    dateSelector: string,
    initialOrder: 'asc' | 'desc',
    newOrder: 'asc' | 'desc'
): Promise<void> {
    // Scroll to the top and open the sort dialog
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator(dialogSort.sortIcon).click();

    // Wait for the sort dialog to appear
    await page.waitForSelector(dialogSort.dialogSort, { state: "visible" });

        // Log initial order
        console.log(`Initial sorting order: ${initialOrder}`);

    // Verify the default sorting order
    const initialOption = initialOrder === "asc" ? dialogSort.dateAscending : dialogSort.dateDescending;
    const selectedOption = page.locator(initialOption);
    await expect(selectedOption).toBeVisible();
    const selectedIcon = selectedOption.locator(dialogSort.iconCheck);
    await expect(selectedIcon).toBeVisible();

    // Select the new sorting order
    const newOptionIndex = newOrder === "asc" ? dialogSort.dateAscending : dialogSort.dateDescending;
    const newOption = page.locator(newOptionIndex);
    await newOption.click();
    await expect(newOption.locator(dialogSort.iconCheck)).toBeVisible();
    await expect(selectedOption.locator(dialogSort.iconCheck)).not.toBeVisible();

    // Apply the new sorting order
    await page.locator(dialogSort.applyButton).click();
    await page.waitForTimeout(5000); // Wait for the list to update

    // Validate the list is sorted in the new order
    await validateItemDisplayOrder(page, itemSelector, dateSelector, newOrder);
}
