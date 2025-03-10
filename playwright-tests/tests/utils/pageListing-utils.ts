import { Locator, Page, expect } from "playwright/test";
import { debugLog } from "./debug-utils";

/**
 * Validate the number of visible items on a listing page.
 * Ensures that the number of displayed items (excluding skeleton loaders) is within the expected range (1-20).
 * 
 * @param page - The Playwright page object
 * @param itemSelector - Selector for the actual items to be counted
 * @param skeletonSelector - Selector for skeleton loading items (if applicable)
 */
export async function validateVisibleItems(
    page: Page,
    itemSelector: string,
    skeletonSelectors?: string,
): Promise<number> {
    // Wait for at least one item to be visible before checking
    await page.waitForSelector(itemSelector, { state: "visible"});

    // Count total items on page
    const totalItems = await page.locator(itemSelector).count();

    // Count skeleton items if a selector is provided
    const skeletonCount = skeletonSelectors ? await page.locator(skeletonSelectors).count() : 0;;

    // Calculate the number of visible items (excluding skeleton)
    const visibleItemCount = totalItems - skeletonCount;

    // Log counts for debugging
    console.log("Total items:", totalItems);
    console.log("Skeleton items:", skeletonCount);
    console.log("Visible items", visibleItemCount);

    // Validate that the number of visible items is within the expected range
    expect(visibleItemCount).toBeGreaterThanOrEqual(1);
    expect(visibleItemCount).toBeLessThanOrEqual(20);

    // Return the count for further use
    return visibleItemCount;
}

/**
 * Verify key components inside the first visible item in a listing page.
 * @param firstItem - Locator for the first visible item
 * @param selectors - Object containing the selectors for the components inside the item
 */
export async function verifyFirstItemComponents(
    firstItem: Locator,
    selectors: string[],
    skeletonSelector?: string
): Promise<void> {
    if (skeletonSelector) {
        const hasSkeleton = await firstItem.locator(skeletonSelector).count();
        if (hasSkeleton > 0) {
            console.log("The first card is a skeleton. Skipping verification.");
            return;
        };
    };

    for (const selector of selectors) {
        await expect(firstItem.locator(selector)).toBeVisible();
    };
}

/**
 * Scroll to the bottom of the page and verify if more items are loaded.
 * Ensures that new items are loaded after scrolling while keeping old items visible.
 * 
 * @param page - The Playwright page object
 * @param itemSelector - Selector for the actual items to be counted
 * @param skeletonSelector - Selector for skeleton loading items (if applicable)
 * @param waitTime - Time (ms) to wait after scrolling before counting items again (default: 10s)
 */
export async function scrollAndValidateLoadMore(
    page: Page,
    totalItemSelector: string,
    itemSelector: string,
    skeletonSelectors?: string,
    waitTime: number = 5000
): Promise<number> {
    // Get total items count from the page
    const totalItemText = await page.locator(totalItemSelector).textContent();
    const totalItems = totalItemText ? parseInt(totalItemText.match(/\d+/)?.[0] || "0", 10) : 0;

    // Get initial visible item count
    const initialTotalItems = await page.locator(itemSelector).count();
    const initialSkeletonCount = skeletonSelectors ? await page.locator(skeletonSelectors).count() : 0;
    const initialVisibleItemCount = initialTotalItems - initialSkeletonCount;

    debugLog("Total items from UI:", totalItems);
    debugLog("Initial visible items:", initialVisibleItemCount);

    // Scroll to trigger loading
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    debugLog("✅ Scrolled to bottom!");

    // Wait for items to load
    await page.waitForTimeout(waitTime);

    // Get updated visible item count
    const updatedTotalItems = await page.locator(itemSelector).count();
    const updatedSkeletonCount = skeletonSelectors ? await page.locator(skeletonSelectors).count() : 0;
    const updatedVisibleItemCount = updatedTotalItems - updatedSkeletonCount;

    debugLog("Updated visible items:", updatedVisibleItemCount);

    // Validate based on total items
    if (totalItems <= 20) {
        expect(updatedVisibleItemCount).toBe(initialVisibleItemCount);
    } else {
        expect(updatedVisibleItemCount).toBeGreaterThan(initialVisibleItemCount);
    }

    return updatedVisibleItemCount;
}