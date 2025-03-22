import { Page } from '@playwright/test';
import OrderGeneralHelper from '../../orderGeneralHelper';
import mockDataOrderListPage1Pagesize2Sort4 from '../../../../tests/mockData/path/activity/order/list/params/page1_pageSize2_searchKey_sort4.json' assert {type: 'json'} ;
import d3431867_d71f_4fb6_b246_a9f85c8f5678 from '../../../../tests/mockData/path/activity/order/d3431867-d71f-4fb6-b246-a9f85c8f5678.json' assert {type: 'json'} ;
import _3d006983_6208_4e74_bcfa_de262d37f2c9 from '../../../../tests/mockData/path/activity/order/3d006983-6208-4e74-bcfa-de262d37f2c9.json' assert {type: 'json'} ;

export const orderIdOfDataWithFullFields = "d3431867-d71f-4fb6-b246-a9f85c8f5678";
export const orderIdOfDataLackingOfFields = "3d006983-6208-4e74-bcfa-de262d37f2c9";

class OrderDetailPageHelper extends OrderGeneralHelper {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 
   */
  override async ordersListRoute () : Promise<void> {
		await this.page.route(OrderDetailPageHelper.ordersListAPIWildCard, async route => {
      await route.fetch();
      let rawMockData = mockDataOrderListPage1Pagesize2Sort4;
      await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
		});
	}

  async orderDetailRoute () : Promise<void> {
		await this.page.route(OrderDetailPageHelper.orderDetailAPIWildCard, async route => {
      await route.fetch();
      if (this.page.url().includes(orderIdOfDataWithFullFields)) {
        let rawMockData = d3431867_d71f_4fb6_b246_a9f85c8f5678;
        await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
      }
      else {
        let rawMockData = _3d006983_6208_4e74_bcfa_de262d37f2c9;
        await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
      }
		});
	}
}

export default OrderDetailPageHelper;