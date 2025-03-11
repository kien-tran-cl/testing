import { Locator, Page } from '@playwright/test';
import Header from './header'

class HeaderLevel1 extends Header {
  constructor(page: Page, pageName: string) {
    super(page, pageName);
  }

  /**
   * 
   * @returns 
   */
  hamburgerMenuEle(): Locator {
    return this._hamburgerMenuEle;
  }
}

export default HeaderLevel1;