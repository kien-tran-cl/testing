import { Locator, Page } from '@playwright/test';
import HelperBase from '../helperBase';

abstract class Header extends HelperBase {
  protected readonly page : Page;
  protected readonly _pageName: string;
  protected readonly _headerEle: Locator;

  constructor (page: Page, pageName: string) {
    super(page);
    this.page = page;
    this._pageName = pageName;
    this._headerEle = this.page.locator('gedat-header');
  }

  /**
   * 
   * @returns 
   */
  pageTitleEle(): Locator {
    return this._headerEle.getByText(this._pageName);
  }
}

export default Header;