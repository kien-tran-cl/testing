import { expect } from "playwright/test";
import { test } from "../base";
import {
  activitiesSelectors,
  dialogSort,
  inquiriesPageSelectors,
  searchFilter,
} from "../utils/selectors";
import { loginBeforeTest } from "../common";
import { appUrl } from "../utils/auth-utils";
import {
  toggleAndSetDisplayOrder,
  validateItemDisplayOrder,
} from "../utils/sorting-utils";

test.describe("E2E - Inquiries Search & Filtering", () => {
  test.describe.configure({
    timeout: 90000,
    mode: "serial",
  });

  test.beforeEach(async ({ page }) => {
    await loginBeforeTest(page);
  });

  test("Verify Inquiries Search & Filter", async ({ page, i18n }) => {
    await test.step("Step 1: Verify Inquiries page components", async () => {
      // Step 1 Verify default page components
      await page.locator(activitiesSelectors.inquiriesCard).click();
      await expect(page).toHaveURL(appUrl("/activities/inquiries/list"));
      await page.waitForTimeout(5000);

      // Wait for cards and skeletons to be visible
      await page.waitForSelector(inquiriesPageSelectors.inquiriesItem, {
        state: "visible",
      });

      // Verify Card is displayed, and the card number is between 1 and 20
      const inquiriesCards = await page.locator(
        inquiriesPageSelectors.inquiriesItem,
      );
      const skeletonCards = await page.locator(
        inquiriesPageSelectors.inquiriesSkeletonItem,
      );

      // Count the number of visible inquiries cards and skeleton cards
      const count = await inquiriesCards.count();
      const skeletonCount = await skeletonCards.count();

      console.log(
        "Default page is showing",
        count,
        "inquiries cards including",
        skeletonCount,
        "skeleton cards",
      );

      // Ensure the number of displayed cards is between 1 and 20 and excludes skeleton cards
      const visibleItemCount = count - skeletonCount;
      await expect(visibleItemCount >= 1 && visibleItemCount <= 20).toBe(true);

      // Step 2: Verify components inside card
      if (visibleItemCount > 0) {
        const firstCard = inquiriesCards.nth(0); // Get the first visible card

        // Skip skeleton card
        const hasSkeleton = await firstCard
          .locator(inquiriesPageSelectors.inquiriesSkeletonItem)
          .count();
        if (hasSkeleton > 0) {
          console.log("The first card is a skeleton. Skipping verification.");
        } else {
          // Verify status
          const statusVisible = await firstCard
            .locator(inquiriesPageSelectors.status)
            .isVisible();
          await expect(statusVisible).toBe(true);

          // Verify occupation (qualification)
          const occupationVisible = await firstCard
            .locator(inquiriesPageSelectors.occupation)
            .isVisible();
          await expect(occupationVisible).toBe(true);

          // Verify number of workers
          const workersVisible = await firstCard
            .locator(inquiriesPageSelectors.numberOfWorker)
            .isVisible();
          await expect(workersVisible).toBe(true);

          // Verify company name and city
          const companyCityVisible = await firstCard
            .locator(inquiriesPageSelectors.companyNameAndCity)
            .isVisible();
          await expect(companyCityVisible).toBe(true);

          // Verify date
          const dateVisible = await firstCard
            .locator(inquiriesPageSelectors.date)
            .isVisible();
          await expect(dateVisible).toBe(true);

          console.log(
            "First card contains all required components and they are visible.",
          );
        }
      }
    });

    await test.step("Step 2: Verify scroll to load - maximum of 20 additional items per load / items before load still display", async () => {
      // Step 1: Get initial visible item count before scrolling
      const inquiriesCards = await page.locator(
        inquiriesPageSelectors.inquiriesItem,
      );
      const skeletonCards = await page.locator(
        inquiriesPageSelectors.inquiriesSkeletonItem,
      );

      // Wait for cards and skeletons to be visible
      await page.waitForSelector(inquiriesPageSelectors.inquiriesItem, {
        state: "visible",
      });

      // Count the number of visible inquiries cards and skeleton cards
      const initialCount = await inquiriesCards.count();
      const skeletonCount = await skeletonCards.count();
      const initialVisibleItemCount = initialCount - skeletonCount;

      console.log("Initial visible items count: ", initialVisibleItemCount);

      // Step 2: Scroll down to trigger loading of more items
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom
      });

      // Step 3: Wait for 10 seconds to allow the page to load more items
      await page.waitForTimeout(10000); // Wait for items to load

      // Step 4: Get the new visible item count after scrolling
      const updatedInquiriesCards = await page.locator(
        inquiriesPageSelectors.inquiriesItem,
      );
      const updatedInquiriesCount = await updatedInquiriesCards.count();
      console.log("updated inquiries count", updatedInquiriesCount);

      const updatedskeletonCards = await page.locator(
        inquiriesPageSelectors.inquiriesSkeletonItem,
      );
      const updatedskeletonCount = await updatedskeletonCards.count();
      console.log("updated skeleton count:", updatedskeletonCount);

      const updatedVisibleItemCount =
        updatedInquiriesCount - updatedskeletonCount;

      console.log(
        "Updated visible items count after scrolling: ",
        updatedVisibleItemCount,
      );

      // Step 5: Check if the new visible item count is greater than the initial count
      if (updatedVisibleItemCount > initialVisibleItemCount) {
        console.log(
          `Scroll to load successful, the page now have ${updatedVisibleItemCount} items in total.`,
        );
      } else {
        throw new Error(
          "Scroll to load did not work correctly. Visible items count did not increase.",
        );
      }
    });

    await test.step("Step 3: Verify Sorting items function", async () => {
      // Verify default Date Descending sorting before any interaction
      await validateItemDisplayOrder(
        page,
        inquiriesPageSelectors.inquiriesItem,
        inquiriesPageSelectors.date,
        "desc",
      );

      // Toggle sorting dialog and change to ascending order
      await toggleAndSetDisplayOrder(
        page,
        inquiriesPageSelectors.inquiriesItem,
        inquiriesPageSelectors.date,
        "desc",
        "asc",
      );

      // Verify items are sorted in ascending order
      await validateItemDisplayOrder(
        page,
        inquiriesPageSelectors.inquiriesItem,
        inquiriesPageSelectors.date,
        "asc",
      );
    });

    // Variable to store the total number of inquiries from Company filter (step 4)
    let parentFilterTotalItems = 0;
    let selectedClientFilterText = ""; // Declare it globally to reuse in later steps
    let selectedStatusFilterText = ""; // Declare it globally to reuse in later steps

    await test.step("Step 4: Verify filtering inquiries based on Company", async () => {
      // Click on the All clients button in the search bar
      await page.locator(searchFilter.clientFilter).click();

      // -> Verify Client filter displayed, and included at least 1 company to filter
      await page.waitForSelector(searchFilter.filterFormOverlay, {
        state: "visible",
      });
      await page.waitForSelector(searchFilter.filterOptions, {
        state: "visible",
      });

      // -> Find in the list and focus on the first company that has item >=1
      // Capture that number and call it companyTotalItems (A), also capture company name and call it companyName (B), then click on that company
      const numberElements = await page.locator(
        `${searchFilter.filterOptions} div.grid p`,
      ); // Locator for the number part
      const textElements = await page.locator(
        `${searchFilter.filterOptions} p.flex-1`,
      ); // Locator for the text part

      const numbers: number[] = [];
      const texts: string[] = [];
      const itemCount = await numberElements.count();

      let companyTotalItems = 0; // Number of Items in the company with the most items in the list
      let companyName = ""; // Name of the corresponding company with the most items in the list
      let maxIndex = -1;

      for (let i = 1; i < itemCount; i++) {
        const numberText = await numberElements.nth(i).innerText();
        const number = parseInt(numberText.trim(), 10); // Get the Items in the company
        const text = await textElements.nth(i).innerText(); // Get the company name

        if (!isNaN(number)) {
          numbers.push(number);
          texts.push(text);
          if (number > companyTotalItems) {
            companyTotalItems = number; // Update the maximum Items
            companyName = text; // Update the corresponding company name
            maxIndex = i; // Save the index of the maximum Items
          }
        }
      }

      console.log("Extracted items of all companies:", numbers); // Log items of all companies number to check
      console.log("Extracted names of all companies:", texts); // Log texts to check
      console.log("Total items of the selected company:", companyTotalItems);
      console.log("Name of the selected company:", companyName);

      // Click on the company containing the most items
      if (companyTotalItems > 0 && maxIndex >= 0) {
        const itemWithMaxNumber = page.locator(
          `${searchFilter.filterOptions} >> nth=${maxIndex}`,
        );
        await itemWithMaxNumber.click();
        console.log(
          `Clicked on item with the highest number: ${companyTotalItems}`,
        );
      } else {
        console.log("No valid item with a number greater than 0 to click.");
        return; // Exit the test early if no valid item found
      }

      await page.waitForTimeout(3000);

      // Close the filter form
      await page.locator(searchFilter.closeFilter).click();
      await page.waitForTimeout(3000);
      await page.waitForSelector(searchFilter.filterFormOverlay, { state: "hidden" });
      console.log("Verified that the filter form overlay has closed.");

      // -> Verify companyName is displaying on the right side of the search bar
      const clientFilterText = await page
        .locator(searchFilter.clientFilterText)
        .innerText();
      console.log(
        "Company Name displayed on the search bar:",
        clientFilterText,
      );
      if (clientFilterText.trim() === companyName.trim()) {
        console.log(
          "Verified: Displayed text matches the selected company name.",
        );
        selectedClientFilterText = clientFilterText.trim();
      } else {
        console.error(
          "Error: Displayed text does not match the selected company name.",
        );
      }

      // -> Verify number of inquiries cards displaying on page = companyTotalItems (A)
      const sortText = await page.locator(dialogSort.sortText).innerText();
      const sortNumber = parseInt(sortText.match(/^\d+/)?.[0] || "0", 10); // Extract number from text (e.g., "13 Anfragen" -> 13)
      console.log("Extracted number from sortText:", sortNumber);
      if (sortNumber === companyTotalItems) {
        console.log(
          "Verified: Number of inquiries matches the selected company's count.",
        );
      } else {
        console.error(
          "Error: Number of inquiries does not match the selected company's count.",
        );
      }

      // Store the value of number of inquiries cards after completing Step 4
      parentFilterTotalItems = companyTotalItems;
      console.log(
        "Number of items after executed level 1 filtering:",
        parentFilterTotalItems,
      );
    });

    await test.step("Step 5: Verify filtering inquiries based on status", async () => {
      // Click on the search bar then verify there are 2 filter options - then click on the 1st option 'all status'
      await page.locator(searchFilter.inputField).click();

      const multiselectFilters = page.locator(searchFilter.multiselectFilter);

      const count = await multiselectFilters.count();
      expect(count).toBe(2);

      for (let i = 0; i < count; i++) {
        await expect(multiselectFilters.nth(i)).toBeVisible();
      }

      await multiselectFilters.nth(0).click();

      // -> Verify Status filter displayed, and included at least 1 status to filter
      await page.waitForSelector(searchFilter.filterFormOverlay, {
        state: "visible",
      });
      await page.waitForSelector(searchFilter.filterOptions, {
        state: "visible",
      });

      // -> FInd in the list and focus on the first status that has item >=1 then capture that number and call it C, also capture status name and call it D -> then click on that filter -> then click on Done
      const numberElements = await page.locator(
        `${searchFilter.filterOptions} div.grid p`,        
      ); // Locator for the number part - which is C
      const textElements = await page.locator(
        `${searchFilter.filterOptions} p.flex-1`,
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
      }

      console.log("Extracted items of all status:", numbers); // Log items of all companies number to check
      console.log("Extracted names of all status name:", texts); // Log texts to check
      console.log("Total items of the selected status:", companyTotalItems);
      console.log("Name of the selected status:", companyName);

      // Click on the company containing the most items
      if (companyTotalItems > 0 && maxIndex >= 0) {
        const itemWithMaxNumber = page.locator(
          `${searchFilter.filterOptions} >> nth=${maxIndex}`,
        );
        await itemWithMaxNumber.click();
        console.log(
          `Clicked on item with the highest number: ${companyTotalItems}`,
        );
      } else {
        console.log("No valid item with a number greater than 0 to click.");
        return; // Exit the test early if no valid item found
      }

      // -> Select an additional status above or below the current selection
      if (maxIndex > 1) {
        // If not the first row, select the status above
        const itemAbove = page.locator(
          `${searchFilter.filterOptions} >> nth=${maxIndex - 1}`,
        );
        await itemAbove.click();
        console.log(
          "Clicked on the status option above the largest item status.",
        );
      } else if (maxIndex === 1 && itemCount > 2) {
        // If the first row, select the status below (if available)
        const itemBelow = page.locator(
          `${searchFilter.filterOptions} >> nth=${maxIndex + 1}`,
        );
        await itemBelow.click();
        console.log(
          "Clicked on the status option below the largest item status.",
        );
      } else {
        console.warn("No other status option to select.");
      }

      await page.waitForTimeout(1000);

      // -> Verify the filter is multi selection form - will still visible after selected item
      await page.waitForSelector(searchFilter.filterFormOverlay, {
        state: "visible",
      });
      console.log("Verified that the filter form overlay still visible.");

      // -> Verify the form will be hidden after user confirmation - by clicking on 'Done' button
      await page.locator(searchFilter.closeFilter).click();
      await page.waitForTimeout(3000);
      await page.waitForSelector(searchFilter.filterFormOverlay, {
        state: "hidden",
      });
      console.log(
        "Verified that the filter form overlay has been closed after clicked on Done button",
      );

      // -> Verify companyName is displaying on the right side of the search bar
      const currentClientFilterText = await page
        .locator(searchFilter.clientFilterText)
        .innerText();
      console.log(
        "Currently displayed client filter text:",
        currentClientFilterText,
      );

      if (currentClientFilterText.trim() === selectedClientFilterText) {
        console.log(
          "Verified: The client filter text remains consistent with the selected value from Step 4.",
        );
      } else {
        console.error(
          "Error: The client filter text does not match the value selected in Step 4.",
        );
      }

      // Verify the dropdown is now displaying the selected status
      const multiselectFilterText = await page
        .locator(`${searchFilter.multiselectFilter} >> nth=1`)
        .innerText();
      console.log(
        "Dropdown text displayed on the filter:",
        multiselectFilterText,
      );

      // Process and store the dropdown text
      const selectedItems = multiselectFilterText
        .split(",")
        .map((item) => item.trim()); // Split into selected items
      console.log("Processed selected items:", selectedItems);

      if (selectedItems.includes(companyName)) {
        console.log(
          "Verified: Dropdown text contains the selected company name.",
        );
        selectedStatusFilterText = multiselectFilterText.trim(); // Save the entire dropdown text globally
      } else {
        console.error(
          "Error: Dropdown text does not contain the selected company name.",
        );
      }

      // -> Verify count of C <= A in the company filter
      if (companyTotalItems <= parentFilterTotalItems) {
        console.log(
          `Verified: Total items in status filter (C = ${companyTotalItems}) is less than or equal to total items in company filter (A = ${parentFilterTotalItems}).`,
        );
      } else {
        console.log(
          `Error: Total items in status filter (C = ${companyTotalItems}) is greater than total items in company filter (A = ${parentFilterTotalItems}).`,
        );
      }

      // -> Verify number of inquiries card displaying on page = C
      const sortText = await page.locator(dialogSort.sortText).innerText();
      const sortNumber = parseInt(sortText.match(/^\d+/)?.[0] || "0", 10); // Extract number from text (e.g., "13 Anfragen" -> 13)
      console.log("Extracted number from sortText:", sortNumber);
      if (sortNumber === companyTotalItems) {
        console.log(
          "Verified: Number of inquiries matches the selected company's count.",
        );
      } else {
        console.error(
          "Error: Number of inquiries does not match the selected company's count.",
        );
      }
    });

    await test.step("Step 6: Verify filtering inquiries based on occupations", async () => {
      // Click on the the All occupations
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
        `${searchFilter.filterOptions} p.break-all`,
      ); // Locator for company name

      const itemCount = await numberElements.count();
      let zeroItemIndex = -1;

      for (let i = 1; i < itemCount; i++) {
        const numberText = await numberElements.nth(i).innerText();
        const number = parseInt(numberText.trim(), 10); // Convert text to number

        if (number === 0) {
          zeroItemIndex = i; // Store the index of the first company with 0 items
          break; // Exit the loop as soon as we find the first match
        }
      }

      let selectedQualificationText = "";

      if (zeroItemIndex >= 0) {
        // Get the name of the company with 0 items (optional, for logging purposes)
        const companyName = await textElements.nth(zeroItemIndex).innerText();
        console.log(
          `Found a company with 0 items: "${companyName}" at index ${zeroItemIndex}`,
        );

        selectedQualificationText = companyName;
        console.log("Selected qualification text:", selectedQualificationText);

        // Click on the company with 0 items
        const zeroItemCompany = page.locator(
          `${searchFilter.filterOptions} >> nth=${zeroItemIndex}`,
        );
        await zeroItemCompany.click();
        console.log(`Clicked on the company with 0 items: "${companyName}"`);
      } else {
        console.error("No company with 0 items was found in the filter.");
      }

      // -> Verify the form will be hidden after user confirmation - by clicking on 'Done' button
      await page.locator(searchFilter.closeFilter).click();
      await page.waitForTimeout(3000);
      await page.waitForSelector(searchFilter.filterFormOverlay, {
        state: "hidden",
      });
      console.log(
        "Verified that the filter form overlay has been closed after clicked on Done button",
      );

      // -> Verify companyName is displaying on the right side of the search bar
      const currentClientFilterText = await page
        .locator(searchFilter.clientFilterText)
        .innerText();
      console.log(
        "Currently displayed client filter text:",
        currentClientFilterText,
      );

      if (currentClientFilterText.trim() === selectedClientFilterText) {
        console.log(
          "Verified: The client filter text remains consistent with the selected value from Step 4.",
        );
      } else {
        console.error(
          "Error: The client filter text does not match the value selected in Step 4.",
        );
      }

      // -> Verify the selected status are shown separated by comma in the status filter button
      const currentStatusFilterText = await page
        .locator(`${searchFilter.multiselectFilter} >> nth=1`)
        .innerText();
      console.log(
        "Currently displayed dropdown text:",
        currentStatusFilterText,
      );

      if (currentStatusFilterText.trim() === selectedStatusFilterText) {
        console.log(
          "Verified: The dropdown text remains consistent with the selected value from Step 5.",
        );
      } else {
        console.error(
          "Error: The dropdown text does not match the value selected in Step 5.",
        );
      }

      // -> Verify the selected qualification is shown in the qualification filter button (active state)
      const currentQualificationFilterText = await page
        .locator(searchFilter.multiselectFilter)
        .nth(2)
        .innerText();
      console.log(
        "Currently displayed qualification filter text:",
        currentQualificationFilterText,
      );

      if (
        currentQualificationFilterText.trim() ===
        selectedQualificationText.trim()
      ) {
        console.log(
          "Verified: The qualification filter button displays the correct selected value.",
        );
      } else {
        console.error(
          "Error: The qualification filter button does not match the selected qualification.",
        );
        console.error(
          `Expected: "${selectedQualificationText.trim()}", but found: "${currentQualificationFilterText.trim()}"`,
        );
      }

      // -> Verify a warning message is displayed
      const warningMessage = page.locator(searchFilter.emptyFilterMessage);
      await expect(warningMessage).toBeVisible();
      expect(warningMessage).toHaveText(i18n.t("common.emptyFilter.desc"));

      console.log(
        "Warning Message on UI is",
        i18n.t("common.emptyFilter.desc"),
      );
    });

    await test.step("Step 7: Verify reset filtering function", async () => {
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

    await test.step("Step 8: Verify search function", async () => {
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

      console.log("Number of cards after search", searchReusultsCount);

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