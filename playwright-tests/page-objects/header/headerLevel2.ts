import { Locator, Page } from '@playwright/test';
import Header from './header'

class HeaderLevel2 extends Header {
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

export default HeaderLevel2;