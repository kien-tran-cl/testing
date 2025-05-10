import { Page, Response } from '@playwright/test';

abstract class Sort {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 
   * @param expectedTextsInUI 
   * @param sort 
   */
  abstract applySorting(expectedTextsInUI: any, sort: number) : Promise<Response>;
}

export default Sort;