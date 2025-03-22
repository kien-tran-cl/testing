import { Page } from '@playwright/test';

class ActivitiesPage {
	private readonly page : Page;

	constructor (page: Page) {
		this.page = page;
	}

	/**
	 * 
	 * @param cardTitle provide title of the card
	 */
	async navigateToCard(cardTitle: string) : Promise<void> {
		await this.page.locator('.card-item', {hasText: cardTitle}).click();
	}
}

export default ActivitiesPage;