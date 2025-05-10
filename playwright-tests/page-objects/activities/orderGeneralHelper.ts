import { Page } from '@playwright/test';
import HelperBase from '../helperBase';

abstract class OrderGeneralHelper extends HelperBase {
	public static readonly ordersListAPIWildCard = '*/**/api/v1/activity/order?page**';
	public static readonly orderDetailAPIWildCard = '*/**/api/v1/activity/order/*';
	
	constructor(page: Page) {
		super(page);
	}

	abstract ordersListRoute () : Promise<void>;

	/**
	 * 
	 * @param orderStatus 
	 * @returns 
	 */
	static verifyValidStatus(orderStatus: number) : boolean {
		const expectOrderStatuses = [1,2,4];
		if (!expectOrderStatuses.includes(orderStatus) && orderStatus) {//null is a valid orderStatus -> Label: "No status available"
			return false;
		}
		return true;
	}
}

export default OrderGeneralHelper;