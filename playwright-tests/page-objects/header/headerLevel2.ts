import { Locator, Page } from '@playwright/test';
import Header from './header'

class HeaderLevel2 extends Header {
  private readonly _backArrowButtonEle: Locator;

  constructor(page: Page, pageName: string) {
    super(page, pageName);
    this._backArrowButtonEle = this._headerEle.locator('.icon-chevron-left');
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