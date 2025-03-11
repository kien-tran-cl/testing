import { Page, expect, Response } from '@playwright/test';
import Sort from '../sort';

class ActivitiesSort extends Sort {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 
   * @param page 
   * @param expectedTextsInUI 
   * @param sort 
   */
  override async applySorting(expectedTextsInUI: any, sort: number) : Promise<Response> {
    let sortPopupEle = this.page.getByRole('dialog').filter({hasText: expectedTextsInUI.popupSortTitle});
    // check if the sorting popup is already showed
    if (await sortPopupEle.isVisible({timeout: 1000}) == false) {
      const sortIconEle = this.page.locator('.icon-switch-vertical-02.text-xl');//get the sort icon element
      await sortIconEle.scrollIntoViewIfNeeded();//scroll to the header title
      await this.page.waitForTimeout(500);
  
      await sortIconEle.click();//click on the sort icon element
      sortPopupEle = this.page.getByRole('dialog').filter({hasText: expectedTextsInUI.popupSortTitle});
      await sortPopupEle.waitFor({state: 'visible'});
    }
    const sortOptionEle = (sort == 3) ? sortPopupEle.getByText(expectedTextsInUI.dateAscending) : sortPopupEle.getByText(expectedTextsInUI.dateDescending);
    await sortOptionEle.click();//click on the date ascending element
    await this.page.waitForTimeout(500);

    if (sort == 3) {
      const dateAscendingCheckIconEle = sortPopupEle.locator('gedat-select-row', {hasText: expectedTextsInUI.dateAscending}).locator('.icon-check');//get the check icon element in the date ascending element
      // assert that the check icon should be displayed in the date ascending element
      await expect(dateAscendingCheckIconEle).toBeVisible();
    }
    else {
      const dateDescendingCheckIconEle = sortPopupEle.locator('gedat-select-row', {hasText: expectedTextsInUI.dateDescending}).locator('.icon-check');//get the check icon element in the date descending element
      // assert that the check icon should be displayed in the date descending element
      await expect(dateDescendingCheckIconEle).toBeVisible();
    }
    
    const applyButtonEle = sortPopupEle.getByText(expectedTextsInUI.applyButton);//get the apply button element
    await applyButtonEle.click();//click on the apply button element
    const response = await this.page.waitForResponse(response => 
      response.url().includes('/api/v1/activity/order?page=') && response.status() == 200,
      {timeout:3000}
    );
    return response;
  }
}

export default ActivitiesSort;