import { expect, Locator } from "playwright/test";
import { test } from "../base";
import {
  salesActivitiesPageSelectors,
  salesActivitiesDetailsSelectors,
  contactDetailSelectors,
  allChild
} from "../utils/selectors";
import { loginBeforeTest } from "../common";
import { appUrl } from "../utils/auth-utils";
import {
  toggleAndSetDisplayOrder,
  validateItemDisplayOrder,
} from "../utils/sorting-utils";
import exp from "constants";

test.describe("E2E - Sales Activity Details", () => {
  const extentAPIEndpoint = 'activity/inquiry/list/'
  test.describe.configure({
    timeout: 120000,
    mode: "serial",
  });
  test.beforeEach(async ({ page }) => {
    console.log('Precondition 1. Login:');
    await loginBeforeTest(page);
    console.log('Precondition 2. Go to sales-activity list:');
    await page.goto(appUrl("/activities/sales-activities/list"));
    await page.waitForLoadState("networkidle");
  });
  
  test("Verify Sale Activity Details", async ({ page, i18n }) => {
    let contentsNeedToCheck = {
      contactPerson: "",
      reporter: "",
      forwardedPerson: "",
    }
    // 1, 2, ..., 35
    await test.step("Step 1: Click on the first item", async () => {
      console.log('Step 1: Click on the first item');
      const activitiesEle = page.locator(salesActivitiesPageSelectors.gedatActivitiesEle);//get gedat-activities element
      const activitiesDetailListDiv = activitiesEle.locator(allChild).nth(1);//get the second element inside getdat-activities element

      const firstItemEle = activitiesDetailListDiv.locator(allChild).nth(0);//get the first element in sales activities list

      firstItemEle.click();//click on the first element
      await page.waitForLoadState();

      // const listResponse = await page.request.get(
      //   'https://sales.timejob-online.dev/api/v1/activity/sales/list?page=1&pageSize=20&searchKey=&sort=4',
      //   {
      //     headers: {
      //       accept: 'application/json',
      //       authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiYTFkOGE4LTNmOTItNDA1Yy1hNWZiLTY4OTYwYWEwMDkxOSIsInR5cCI6IkpXVCJ9.eyJhdWQiOltdLCJjbGllbnRfaWQiOiJiNjdjZGQ3Ni1lOGMzLTRiNzMtOWEwYi1lMWY5N2NkY2VkYTEiLCJleHAiOjE3Mzg4MzI3MDEsImV4dCI6eyJnaXZlbk5hbWUiOiJDaHJpc3RpYW4iLCJyZXNvdXJjZUlkIjoia2trNnA5N2x6YXZuZCIsInNpZCI6IjM5MzUxYWNhLWQwOWUtNDU0Yy04MjFlLTg2ZGM3Mzg4NzQ0ZSIsInRlbmFudElkIjoiODE4YzU0ZDItYjY5YS00ZjRlLTgzZmQtZWNlZjRkYzM1NTg2IiwidXNlcklkIjoiNDAxZjdjNTYtNTgxYy00YmRjLWIxMGQtYzhiM2MxNDRhN2QzIn0sImlhdCI6MTczODgyOTEwMiwiaXNzIjoiaHR0cHM6Ly9vcnkudGltZWpvYi1vbmxpbmUuZGV2IiwianRpIjoiN2U0MzM2ODEtYzk2Mi00YjRhLTkzNzQtNWE0ZDhmYzQyMzhlIiwibmJmIjoxNzM4ODI5MTAyLCJzY3AiOlsib3BlbmlkIiwib2ZmbGluZV9hY2Nlc3MiXSwic3ViIjoiY2ZlN2M1MzUtMDE0OS00ZmUzLThiZWItNjNkZjk5NzdiM2JjIn0.pd2cOG7O2BCuurOemxAvw4_NoHqfyN1CsHU3y88kg6Fs3Y7Qy3ucj4y4YSzLSH71A4uwdTbmfE_GH0WjkK8mz3zo0cseXWfc19yfl-KD0dgh-WYXFsm_px4MTorhQLC8I6OYiayMsDBmlxGOcMuYk7m07_oS0HW1nebVMKt1m1fdCxp52uXPyVmJha1CYSDl0Sk-tJshuwGnWXGc3UczJxD8ttw8swZ7pIjmvw2BhDVmKw1yAOX9M-miHJkrqWjcu_VaygG4tLyrvWdCX6b5Nngn_DQ-FBMQiRN3kvh4FeiTnt7shLi9I8wTN_ZJ4YBbILQhi3xDLX-kKU3gsOEXymrjB10_X0GqTp7RP1ljnxxwQzxvCErAjCcKZ8qniBEEAnsRC-sx3vFSDv7IGiO7gl-3uSDYQh-P9AFueKuKsjS_Hl3mNQDU-WZ1zEM22VbDL4qdiR6lBxbSzXiTvXVzs9RIzGbz0MkrD3vmkaKdXOzXRaCNj0MWcN2QgSkzteDfSSeYME9dBXv30yya2Jy0UpJIE3OUCNc0CZ8t4AC0gyCtirdA-aERcgiGuP1X8uu7nmsAaTYLk8BerYkb7caDhub-ZlIkX34cksWlyO9Dk_t6uUAOuy1nTKmpwkR_V7ewDu6bH65BWainJjpxKeqDM5Nih5GlshijXCVjLPXCaSk'
      //     }
      //   }
      // );
      // await page.waitForTimeout(5000);
      // if(listResponse.status() == 401) {
      //   throw new Error('Need to login again');
      // }
      // const listResponseData = await listResponse.json();
      // if (listResponseData.count == 0) {
      //   throw new Error('There is no sale activity in the list');
      // }

      // const detailResponse = await page.request.get(
      //   'https://sales.timejob-online.dev/api/v1/activity/sales/'+listResponseData.data[0].id,
      //   {
      //     headers: {
      //       accept: 'application/json',
      //       authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjdiYTFkOGE4LTNmOTItNDA1Yy1hNWZiLTY4OTYwYWEwMDkxOSIsInR5cCI6IkpXVCJ9.eyJhdWQiOltdLCJjbGllbnRfaWQiOiJiNjdjZGQ3Ni1lOGMzLTRiNzMtOWEwYi1lMWY5N2NkY2VkYTEiLCJleHAiOjE3Mzg4MzI3MDEsImV4dCI6eyJnaXZlbk5hbWUiOiJDaHJpc3RpYW4iLCJyZXNvdXJjZUlkIjoia2trNnA5N2x6YXZuZCIsInNpZCI6IjM5MzUxYWNhLWQwOWUtNDU0Yy04MjFlLTg2ZGM3Mzg4NzQ0ZSIsInRlbmFudElkIjoiODE4YzU0ZDItYjY5YS00ZjRlLTgzZmQtZWNlZjRkYzM1NTg2IiwidXNlcklkIjoiNDAxZjdjNTYtNTgxYy00YmRjLWIxMGQtYzhiM2MxNDRhN2QzIn0sImlhdCI6MTczODgyOTEwMiwiaXNzIjoiaHR0cHM6Ly9vcnkudGltZWpvYi1vbmxpbmUuZGV2IiwianRpIjoiN2U0MzM2ODEtYzk2Mi00YjRhLTkzNzQtNWE0ZDhmYzQyMzhlIiwibmJmIjoxNzM4ODI5MTAyLCJzY3AiOlsib3BlbmlkIiwib2ZmbGluZV9hY2Nlc3MiXSwic3ViIjoiY2ZlN2M1MzUtMDE0OS00ZmUzLThiZWItNjNkZjk5NzdiM2JjIn0.pd2cOG7O2BCuurOemxAvw4_NoHqfyN1CsHU3y88kg6Fs3Y7Qy3ucj4y4YSzLSH71A4uwdTbmfE_GH0WjkK8mz3zo0cseXWfc19yfl-KD0dgh-WYXFsm_px4MTorhQLC8I6OYiayMsDBmlxGOcMuYk7m07_oS0HW1nebVMKt1m1fdCxp52uXPyVmJha1CYSDl0Sk-tJshuwGnWXGc3UczJxD8ttw8swZ7pIjmvw2BhDVmKw1yAOX9M-miHJkrqWjcu_VaygG4tLyrvWdCX6b5Nngn_DQ-FBMQiRN3kvh4FeiTnt7shLi9I8wTN_ZJ4YBbILQhi3xDLX-kKU3gsOEXymrjB10_X0GqTp7RP1ljnxxwQzxvCErAjCcKZ8qniBEEAnsRC-sx3vFSDv7IGiO7gl-3uSDYQh-P9AFueKuKsjS_Hl3mNQDU-WZ1zEM22VbDL4qdiR6lBxbSzXiTvXVzs9RIzGbz0MkrD3vmkaKdXOzXRaCNj0MWcN2QgSkzteDfSSeYME9dBXv30yya2Jy0UpJIE3OUCNc0CZ8t4AC0gyCtirdA-aERcgiGuP1X8uu7nmsAaTYLk8BerYkb7caDhub-ZlIkX34cksWlyO9Dk_t6uUAOuy1nTKmpwkR_V7ewDu6bH65BWainJjpxKeqDM5Nih5GlshijXCVjLPXCaSk'
      //     }
      //   }
      // );
      // console.log(listResponse.status(), detailResponse.status());
      // if(detailResponse.status() == 401) {
      //   throw new Error('Need to login again');
      // }
      // await page.waitForTimeout(5000);
      // const detailResponseData = await detailResponse.json();

      const expectedTextsInUI = {//object stores the text should be displayed in UI
        created: i18n.t("pages.activities.activityDetails.created"),//missing this information in ticket
        followUp: i18n.t("pages.activities.activityDetails.followUp"),  
        kind: i18n.t("pages.activities.activityDetails.kind"), 
        contactPerson: i18n.t("pages.activities.activityDetails.contactPerson"), 
        reporter: i18n.t("pages.activities.activityDetails.reporter"), 
        forwardTo: i18n.t("pages.activities.activityDetails.forwardTo"), 
      }

      //get required content elements
      const itemTitleEle = page.locator(salesActivitiesDetailsSelectors.itemTitle);//get the title element
      const itemCompanyNameEle = page.locator(salesActivitiesDetailsSelectors.itemCompanyName);//get the company name element
      const itemStatusEle = page.locator(salesActivitiesDetailsSelectors.itemStatus).nth(0);//get the status element
      const itemCreatedEle = page.locator(salesActivitiesDetailsSelectors.itemCreated);//get the follow-up element
      const itemFollowUpEle = page.locator(salesActivitiesDetailsSelectors.itemFollowUp);//get the follow-up element
      const itemKindEle = page.locator(salesActivitiesDetailsSelectors.itemKind);//get the kind element
      const itemContactPersonEle = page.locator(salesActivitiesDetailsSelectors.itemContactPerson);//get the contact person element
      const itemReportersEle = page.locator(salesActivitiesDetailsSelectors.itemReporters);//get the reporters element
      const itemForwardedToEle = page.locator(salesActivitiesDetailsSelectors.itemForwardedTo);//get the forwarded person element

      // console.log("Contact person: ", detailResponseData.data.contactPerson);
      // console.log("Reporter: ", detailResponseData.data.reporter);
      // console.log("Forwarded person: ", detailResponseData.data.forwardedTo);
      await page.waitForTimeout(5000);
      const itemContactPersonNameEle = itemContactPersonEle.locator('h4').locator('span');
      if (await itemContactPersonNameEle.count() > 0) {
        contentsNeedToCheck.contactPerson = (await itemContactPersonNameEle.textContent())?.trim() || '';
      }
      // if(detailResponseData.data.contactPerson != "null") {
      //   console.log('CP:', contentsNeedToCheck.contactPerson);
      // }
      const itemReporterNameEle = itemReportersEle.locator('h4').locator('span');
      if (await itemReporterNameEle.count() > 0) {
        contentsNeedToCheck.reporter = (await itemReporterNameEle.textContent())?.trim() || '';

      }
      // if (detailResponseData.data.reporter != null) {
      //   console.log('Rp:', contentsNeedToCheck.reporter);
      // }
      const itemForwardedPersonNameEle = itemForwardedToEle.locator('h4').locator('span');      
      if (await itemForwardedPersonNameEle.count() > 0) {
        contentsNeedToCheck.forwardedPerson = (await itemForwardedPersonNameEle.textContent())?.trim() || '';
      }
      // if (detailResponseData.data.forwardedTo != null) {
      //   console.log('Fp:', contentsNeedToCheck.forwardedPerson);
      // }

      //assert that the required content is visible
      await expect(itemTitleEle).toBeVisible();
      await expect(itemCompanyNameEle).toBeVisible();
      await expect(itemStatusEle).toBeVisible();
      await expect(itemCreatedEle.locator('h4')).toBeVisible();
      await expect(itemFollowUpEle.locator('h4')).toBeVisible();
      await expect(itemKindEle.locator('h4')).toBeVisible();
      await expect(itemContactPersonEle.locator('h4')).toBeVisible();
      await expect(itemReportersEle.locator('h4')).toBeVisible();
      await expect(itemForwardedToEle.locator('h4')).toBeVisible();

      //assert that the title text in UI is the same as text in file language
      expect((await itemCreatedEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.created);
      expect((await itemFollowUpEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.followUp);
      expect((await itemKindEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.kind);
      expect((await itemContactPersonEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.contactPerson);
      expect((await itemReportersEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.reporter);
      expect((await itemForwardedToEle.locator('h5').textContent())?.trim()).toEqual(expectedTextsInUI.forwardTo);
    });

    await test.step("Step 2: Click on the name of the contact person", async () => {
      if (contentsNeedToCheck.contactPerson != "") {
        console.log('Step 2: Click on the name of the contact person');
        const itemContactPersonEle = page.locator(salesActivitiesDetailsSelectors.itemContactPerson).locator('h4').locator('span');//get the contact person element
        await itemContactPersonEle.click();//click on the contact person element
        await page.waitForTimeout(5000);
        
        const contactPersonNameEle = page.locator(contactDetailSelectors.contactName);//get the contact name element
  
        const contactPersonName = await contactPersonNameEle.textContent();
        
        // assert that the contact name element is visible
        await expect(contactPersonNameEle).toBeVisible();
        // assert that the contact name in contact detail page is the same as the contact name showed in sales activity detail page
        expect(contactPersonName?.trim()).toEqual(contentsNeedToCheck.contactPerson);
      }
      else {
        console.log('Skip step 2 because data of contact person is N/A');
      }
    });
    
    await test.step("Step 3: Click on the back arrow", async () => {
      if (contentsNeedToCheck.contactPerson != "") {
        console.log('Step 3: Click on the back arrow');
        await page.locator(contactDetailSelectors.backArrow).click();
        await page.waitForLoadState();
      }
      else {
        console.log('Skip step 3 because data of contact person is N/A');
      }
    });
    
    await test.step("Step 4: Click on the reporter", async () => {
      if (contentsNeedToCheck.reporter != "") {
        console.log('Step 4: Click on the reporter');
        const itemReportersEle = page.locator(salesActivitiesDetailsSelectors.itemReporters).locator('h4').locator('span');//get the reporters element
        await itemReportersEle.click();//click on the reporter element
        await page.waitForTimeout(5000);
  
        const contactPersonNameEle = page.locator(contactDetailSelectors.contactName);
        
        const contactPersonName = await contactPersonNameEle.textContent();
        
        // assert that the contact name element is visible
        await expect(contactPersonNameEle).toBeVisible();
        // assert that the contact name in contact detail page is the same as the reporter name showed in sales activity detail page
        expect(contactPersonName?.trim()).toEqual(contentsNeedToCheck.reporter);
      }
      else {
        console.log('Skip step 4 because data of reporter is N/A');
      }
    });
    
    await test.step("Step 5: Click on the back arrow", async () => {
      if (contentsNeedToCheck.reporter != "") {
        console.log('Step 5: Click on the back arrow');
        await page.locator(contactDetailSelectors.backArrow).click();
        await page.waitForLoadState();
      }
      else {
        console.log('Skip step 4 because data of reporter is N/A');
      }
    });

    await test.step("Step 6: Click on the forwarded person", async () => {
      if (contentsNeedToCheck.forwardedPerson != "") {
        const itemForwardedToEle = page.locator(salesActivitiesDetailsSelectors.itemForwardedTo).locator('h4').locator('span');//get the forwarded person element
        await itemForwardedToEle.click();//click on the forwared person element
        await page.waitForTimeout(5000);
  
        const contactPersonNameEle = page.locator(contactDetailSelectors.contactName);
        
        const contactPersonName = await contactPersonNameEle.textContent();
        
        // assert that the contact name element is visible
        await expect(contactPersonNameEle).toBeVisible();
        // assert that the contact name in contact detail page is the same as the forwared person name showed in sales activity detail page
        expect(contactPersonName?.trim()).toEqual(contentsNeedToCheck.reporter);
      }
      else {
        console.log('Skip step 6 because data of reporter is N/A');
      }
    });
  });
});
