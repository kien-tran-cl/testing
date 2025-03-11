import { Page } from 'playwright/test';
import mockDataOrderListPage1Pagesize20Sort4 from '../../../tests/mockData/path/activity/order/list/params/page1_pageSize20_searchKey_sort4.json' assert {type: 'json'} ;
import mockDataOrderListPage2Pagesize20Sort4 from '../../../tests/mockData/path/activity/order/list/params/page2_pageSize20_searchKey_sort4.json' assert {type: 'json'} ;
import OrderGeneralHelper from '../orderGeneralHelper';

class OrdersPageHelper extends OrderGeneralHelper {
	constructor(page: Page) {
		super(page);
	}

	/**
	 * 
	 */
	override async ordersListRoute () : Promise<void> {
		await this.page.route(OrdersPageHelper.ordersListAPIWildCard, async route => {
			await route.fetch();
			const url = new URL(route.request().url());
			let rawMockData;
			if (url.searchParams.get('page') == '1') {
				rawMockData = mockDataOrderListPage1Pagesize20Sort4;
				await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
			} else if (url.searchParams.get('page') == '2') {
				rawMockData = mockDataOrderListPage2Pagesize20Sort4;
				await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
			} else {
				await route.continue();
			}
		});
	}
}

export default OrdersPageHelper;