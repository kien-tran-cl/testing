import { Page } from '@playwright/test';

abstract class HelperBase {
	protected readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}
}

export default HelperBase;