import { Page, Locator } from 'playwright/test';

/**
 * Helper class to interact with the page.
 * @see https://playwright.dev/docs/actionability
 */
export class UI {
  private constructor(private readonly page: Page) {}

  static of(page: Page): UI {
    return new UI(page);
  }

  getBy(selector: string): Locator {
    return this.page.locator(selector);
  }

  getAllBy(selector: string): Promise<Locator[]> {
    return this.getBy(selector).all();
  }

  getById(id: string): Locator {
    return this.getBy(`#${id}`);
  }

  getByClassName(className: string): Locator {
    return this.getBy(`.${className}`);
  }

  fill(selector: string, value: string): Promise<void> {
    return this.getBy(selector).fill(value);
  }

  async type(
    selector: string,
    value: string,
    clearBeforeType: boolean = true,
  ): Promise<void> {
    if (clearBeforeType) {
      await this.clear(selector);
    }
    await this.click(selector);
    await this.page.keyboard.type(value);
  }

  clear(selector: string): Promise<void> {
    return this.getBy(selector).clear();
  }

  click(selector: string): Promise<void> {
    return this.page.click(selector);
  }

  async getInnerText(selector: string): Promise<string> {
    return (await this.getBy(selector).innerText()).trim();
  }

  waitForSeconds(seconds: number): Promise<void> {
    return this.page.waitForTimeout(seconds * 1000);
  }
}
