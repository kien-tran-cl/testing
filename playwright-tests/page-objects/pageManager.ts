import { Page } from '@playwright/test';
import HeaderLevel1 from '../page-objects/header/headerLevel1';
import HeaderLevel2 from '../page-objects/header/headerLevel2';
import HeaderLevel3 from '../page-objects/header/headerLevel3';
import ActivitiesPage from '../page-objects/activities/activitiesPage';
import OrdersPage from '../page-objects/activities/orders/ordersPage';
import OrderDetailPage from '../page-objects/activities/orders/orderDetail/orderDetailPage';

class PageManager {
	private readonly page: Page;
	private readonly _activityPage: ActivitiesPage;
	private readonly _ordersPage: OrdersPage;
	private readonly _orderDetailPage: OrderDetailPage;
	private readonly _expectedTextsInUI : any;

	constructor (page: Page, expectedTextsInUI: any) {
		this.page = page;
		this._activityPage = new ActivitiesPage(this.page);
		this._ordersPage = new OrdersPage(this.page);
		this._orderDetailPage = new OrderDetailPage(this.page);
		this._expectedTextsInUI = expectedTextsInUI;
	}

	/**
	 * 
	 * @returns 
	 */
	expectedTextsInUI () : any {
		return this._expectedTextsInUI;
	}

	/**
	 * 
	 * @returns 
	 */
	headerLevel1 (pageName: string) : HeaderLevel1 {
		return new HeaderLevel1(this.page, pageName);
	}

	/**
	 * 
	 * @returns 
	 */
	headerLevel2 (pageName: string) : HeaderLevel2 {
		return new HeaderLevel2(this.page, pageName);
	}

	/**
	 * 
	 * @returns 
	 */
	headerLevel3 (pageName: string) : HeaderLevel3 {
		return new HeaderLevel3(this.page, pageName);
	}

	/**
	 * 
	 * @returns 
	 */
	activitiesPage () : ActivitiesPage {
		return this._activityPage;
	}

	/**
	 * 
	 * @returns 
	 */
	ordersPage () : OrdersPage {
		return this._ordersPage;
	}

	/**
	 * 
	 * @returns 
	 */
	orderDetailPage () : OrderDetailPage {
		return this._orderDetailPage;
	}
}

export default PageManager;