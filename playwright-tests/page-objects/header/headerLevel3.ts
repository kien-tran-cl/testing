import { Locator, Page } from '@playwright/test';
import Header from './header'

class HeaderLevel3 extends Header {
  constructor(page: Page, pageName: string) {
    super(page, pageName);
  }

  /**
   * 
   * @returns 
   */
  backArrowButtonEle(): Locator {
    return this._backArrowButtonEle;
  }
}

export default HeaderLevel3;