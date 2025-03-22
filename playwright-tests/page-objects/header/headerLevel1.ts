import { Locator, Page } from '@playwright/test';
import Header from './header'

class HeaderLevel1 extends Header {
  private readonly _hamburgerMenuEle: Locator;

  constructor(page: Page, pageName: string) {
    super(page, pageName);
    this._hamburgerMenuEle = this._headerEle.locator('.icon-menu-01');
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