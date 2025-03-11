import { test } from "../base";
import { loginBeforeTest } from "../common";
import PageManager from "../../page-objects/pageManager";
import { expect } from "playwright/test";
import { orderIdOfDataWithFullFields, orderIdOfDataLackingOfFields } from "../../page-objects/activities/orders/orderDetail/orderDetailPageHelper";
import { appUrl } from "../utils/auth-utils";

test.describe("E2E - Order Details", () => {
  test.describe.configure({
    timeout: 60000,
    mode: "serial",
  });
  test.beforeEach(async ({ page }) => {
    console.log('Precondition 1. Login:');
    await loginBeforeTest(page);
  });
  
  test("Verify Order Details", async ({ page, i18n }) => {
    const expectedTextsInUI = {//object stores the texts should be displayed in UI
      orderDetailTitle: (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') ? 'Auftrag Details' : 'Order Details',
			ordersTitle: i18n.t("pages.activities.activityType.orders"),
			startDate: i18n.t("pages.activities.activityDetails.startOfEmployment"),
			endDate: i18n.t("pages.activities.activityDetails.endOfEmployment"),
			occupation: i18n.t("pages.activities.activityDetails.occupation"),
			equalPay: i18n.t("pages.activities.activityDetails.equalPay"),
			maxLoanPeriod: i18n.t("pages.activities.activityDetails.maximumLoanPeriod"),
			orderNumber: i18n.t("pages.activities.activityDetails.orderNumber"),
			upcoming: i18n.t("pages.activities.status.enum.1"),
			active: i18n.t("pages.activities.status.enum.2"),
			completed: i18n.t("pages.activities.status.enum.4"),
			noStatusAvailable: i18n.t("pages.activities.noStatus"),
			invalidStatusEnum: "pages.activities.status.enum",
			notAvailable: i18n.t("common.notAvailable"),
		}
    const pm = new PageManager(page, expectedTextsInUI);

    await test.step("Step 1: Click on the first item", async () => {
      await pm.orderDetailPage().ordersListRoute();
      await pm.orderDetailPage().orderDetailRoute();

      console.log('Access the orders page');
      pm.activitiesPage().navigateToCard(pm.expectedTextsInUI().ordersTitle);
      await page.waitForResponse(response => 
        response.url().includes('/api/v1/activity/order?page=') && response.status() == 200,
        {timeout: 3000}
      );
      await page.waitForLoadState();

      console.log('Step 1: Click on an item');
      console.log('Step 1.1: Verify the visibility when mocking data');

      const orderEles = pm.ordersPage().ordersEles();
      const firstItem = orderEles.nth(0);
      await firstItem.waitFor({state: 'visible'});

      //verify first item
      await firstItem.click();
      const firstItemResponse = await page.waitForResponse(response => 
				response.url().includes(orderIdOfDataWithFullFields) && response.status() == 200,
				{timeout: 3000}
			);
      let firstItemResponseData = await firstItemResponse.json();
      await page.waitForLoadState();

      //assert that the title text in UI is visible
      await expect(pm.headerLevel3(expectedTextsInUI.orderDetailTitle).pageTitleEle()).toBeVisible();
      
      await pm.orderDetailPage().verifyVisibilityOfOrderDetail(expectedTextsInUI, firstItemResponseData.data);

      //////////////////////////////////////////////////
      //click on the back arrow button
      await pm.headerLevel3(expectedTextsInUI.ordersTitle).backArrowButtonEle().click();
      await page.waitForLoadState();
      
      //assert that the title text in UI is visible
      await expect(pm.headerLevel2(expectedTextsInUI.ordersTitle).pageTitleEle()).toBeVisible();

      const secondItem = orderEles.nth(1);
      await secondItem.waitFor({state: 'visible'});
      
      //verify second item
      await secondItem.click();
      const secondItemResponse = await page.waitForResponse(response => 
				response.url().includes(orderIdOfDataLackingOfFields) && response.status() == 200,
				{timeout: 3000}
			);
      let secondItemResponseData = await secondItemResponse.json();
      await page.waitForLoadState();

      //assert that the title text in UI is visible
      await expect(pm.headerLevel3(expectedTextsInUI.orderDetailTitle).pageTitleEle()).toBeVisible();

      await pm.orderDetailPage().verifyVisibilityOfOrderDetail(expectedTextsInUI, secondItemResponseData.data);

      //////////////////////////////////////////////////
      console.log('Step 1.2: Verify the visibility with actual data');
      //
      await page.unrouteAll();
      await page.goto(appUrl('/activities/orders/list'));
      const actualOrderListResponse = await page.waitForResponse(response =>
        response.url().includes('/api/v1/activity/order?page=') && response.status() == 200,
        {timeout: 3000}
      );
      await page.waitForLoadState();

      const actualOrderListResponseData = await actualOrderListResponse.json();

      //verify first item
      if (actualOrderListResponseData.data.length > 0) {
        const firstItem = pm.ordersPage().ordersEles().nth(0);
        await firstItem.waitFor({state: 'visible'});
        await firstItem.click();
        const firstItemResponse = await page.waitForResponse(response =>
          response.url().includes(actualOrderListResponseData.data[0].id) && response.status() == 200,
          {timeout: 3000}
        );
        let firstItemResponseData = await firstItemResponse.json();
        await page.waitForLoadState();

        //assert that the title text in UI is visible
        await expect(pm.headerLevel3(expectedTextsInUI.orderDetailTitle).pageTitleEle()).toBeVisible();

        await pm.orderDetailPage().verifyVisibilityOfOrderDetail(expectedTextsInUI, firstItemResponseData.data);

        //click on the back arrow button
        await pm.headerLevel3(expectedTextsInUI.ordersTitle).backArrowButtonEle().click();
        await page.waitForLoadState();
        
        //assert that the title text in UI is visible
        await expect(pm.headerLevel2(expectedTextsInUI.ordersTitle).pageTitleEle()).toBeVisible();

        //verify last item of the first page
        let lastItemIndex = 0;
        if (actualOrderListResponseData.data.length > 20) {
          lastItemIndex = 19;
        }
        else {
          lastItemIndex = actualOrderListResponseData.data.length - 1;
        }
        if (lastItemIndex != 0) {//no need to check if last item is the first item
          const lastItemOfFirstPage = pm.ordersPage().ordersEles().nth(lastItemIndex);
          await lastItemOfFirstPage.scrollIntoViewIfNeeded();
          await lastItemOfFirstPage.waitFor({state: 'visible'});
          await lastItemOfFirstPage.click();
          const lastItemOfFirstPageResponse = await page.waitForResponse(response =>
            response.url().includes(actualOrderListResponseData.data[lastItemIndex].id) && response.status() == 200,
            {timeout: 3000}
          );
          let lastItemOfFirstPageResponseData = await lastItemOfFirstPageResponse.json();
          await page.waitForLoadState();
  
          //assert that the title text in UI is visible
          await expect(pm.headerLevel3(expectedTextsInUI.orderDetailTitle).pageTitleEle()).toBeVisible();
          await pm.orderDetailPage().verifyVisibilityOfOrderDetail(expectedTextsInUI, lastItemOfFirstPageResponseData.data);
        }
      }
      else {
        console.log('No order data available');
      }

    });

    await test.step("Step 2: Click on the back button", async () => {
      console.log('Step 2: Click on the back button');
      
      //click on the back arrow button
      await pm.headerLevel3(expectedTextsInUI.ordersTitle).backArrowButtonEle().click();
      await page.waitForLoadState();
      
      //assert that the title text in UI is visible
      await expect(pm.headerLevel2(expectedTextsInUI.ordersTitle).pageTitleEle()).toBeVisible();
    });
  });
});
