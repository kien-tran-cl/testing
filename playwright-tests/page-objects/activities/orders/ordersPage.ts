import { Page, expect, Locator } from '@playwright/test';
import OrdersPageHelper from './ordersPageHelper';
import Sort from '../../sort';
import ActivitiesSort from '../activities-sort'
import OrderGeneralHelper from '../orderGeneralHelper';

class OrdersPage extends OrdersPageHelper {
	private readonly _orderEles: Locator;
	private readonly _activitieSort: Sort;
	
	constructor(page: Page) {
		super(page);
		this._orderEles = page.locator('gedat-activity-item');
		this._activitieSort = new ActivitiesSort(this.page);
	}
	
	/**
	 * 
	 * @returns 
	 */
	ordersEles() : Locator {
		return this._orderEles;
	}

	/**
	 * 
	 * @returns 
	 */
	activitiesSort() : Sort {
		return this._activitieSort;
	}

	/**
	 * 
	 * @param orderEle 
	 * @param expectedTextsInUI 
	 * @param orderData 
	 */
	async verifyVisibilityOfOrder(orderEle: Locator, expectedTextsInUI: any, orderData: any) : Promise<void> {
		const isValidStatus = OrderGeneralHelper.verifyValidStatus(orderData.orderStatus);
		const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, undefined, expectedTextsInUI.completed];
		let gedatActivityItemInfo : {
			"statusEle": Locator,
			"startDateEle": Locator | undefined,
			"workerNameEle": Locator | undefined,
			"profileEle": Locator | undefined,
			"occupationEle": Locator | undefined,
			"maximumLoadPeriodTitle": Locator | undefined,
			"maximumLoadPeriodValue": Locator | undefined,
			"equalPayTitle": Locator | undefined,
			"equalPayValue": Locator | undefined,
			"companyShortEle": Locator | undefined,
		} = {
			"statusEle": orderEle.getByText(
				(isValidStatus)
					? expectedStatusTexts[(orderData.orderStatus) ? orderData.orderStatus : 0]
					: expectedTextsInUI.invalidStatusEnum+"."+orderData.orderStatus
				),
			"startDateEle": undefined,
			"workerNameEle": undefined,
			"profileEle": undefined,
			"occupationEle": undefined,
			"maximumLoadPeriodTitle": undefined,
			"maximumLoadPeriodValue": undefined,
			"equalPayTitle": undefined,
			"equalPayValue": undefined,
			"companyShortEle": undefined,
		}
	
		// assert that required content is visible
		await expect(gedatActivityItemInfo.statusEle, "Expect status element to be visbile").toBeVisible();
		
		if (orderData.employmentStartDate) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				gedatActivityItemInfo.startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
			}
			else {
				gedatActivityItemInfo.startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			// await expect(gedatActivityItemInfo.startDateEle, "Expect employmentStartDate element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityItemInfo.startDateEle = orderEle.locator("//*[@class='text-common-label min-w-10']");
			 // assert when employmentStartDate is null, Not available is displayed
			// expect((await gedatActivityItemInfo.startDateEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
	
		if ((orderData.employee) && (orderData.employee.givenName || orderData.employee.surname)) {
			gedatActivityItemInfo.workerNameEle = orderEle.getByText((
					((orderData.employee.title) ? orderData.employee.title + ' ' : '')
				+ ((orderData.employee.givenName) ? orderData.employee.givenName + ' ' : '')
				+ ((orderData.employee.surname) ? orderData.employee.surname : '')).trim());
			// assert that required content is visible
			await expect(gedatActivityItemInfo.workerNameEle, "Expect workerName element to be visbile").toBeVisible();
		}
		else {
			gedatActivityItemInfo.workerNameEle = orderEle.locator("//*[@class='text-common-info-bold line-clamp-2 title ng-star-inserted']");
			// assert when employee is null or name of employee is null, "Not available" is displayed
			// expect((await gedatActivityItemInfo.workerNameEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
		
		if (orderData.occupationName) {
			gedatActivityItemInfo.occupationEle = orderEle.getByText(orderData.occupationName);
			// assert that required content is visible
			await expect(gedatActivityItemInfo.occupationEle, "Expect occupationName element to be visbile").toBeVisible();
		}
		else {
			gedatActivityItemInfo.occupationEle = orderEle.locator("//*[@class='text-common-label subtitle ng-star-inserted']");
			// assert when occupationName is null, Not available is displayed
			// expect((await gedatActivityItemInfo.occupationEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
		
		gedatActivityItemInfo.maximumLoadPeriodTitle = orderEle.getByText(expectedTextsInUI.maxLoanPeriod);
		await expect(gedatActivityItemInfo.maximumLoadPeriodTitle, "Expect maxiumLoadPeriodTitle element to be visbile").toBeVisible();
		if (orderData.maximumLoanPeriod) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
			}
			else {
				gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			// await expect(gedatActivityItemInfo.maximumLoadPeriodValue, "Expect maxiumLoadPeriodValue element to be visbile and the format matches design").toBeVisbile();
		}
		else {
			gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.locator("//*[@class='ml-1 inline-block flex-1']").nth(0);
			// assert when maximumLoanPeriodDate is null, Not available is displayed
			// expect((await gedatActivityItemInfo.maximumLoadPeriodValue.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
		
		gedatActivityItemInfo.equalPayTitle = orderEle.getByText(expectedTextsInUI.equalPay);
		await expect(gedatActivityItemInfo.equalPayTitle, "Expect equalPayTitle element to be visbile").toBeVisible();
		if (orderData.equalPayDate) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				gedatActivityItemInfo.equalPayValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
			}
			else {
				gedatActivityItemInfo.equalPayValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			// await expect(gedatActivityItemInfo.equalPayValue, "Expect equalPayValue element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityItemInfo.equalPayValue = orderEle.locator("//*[@class='ml-1 inline-block flex-1']").nth(1);
			// assert when equalPayDate is null, Not available is displayed
			// expect((await gedatActivityItemInfo.equalPayValue.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
		
		if (orderData.companyNameShort) {
			gedatActivityItemInfo.companyShortEle = orderEle.getByText(orderData.companyNameShort);
			// assert that required content is visible
			await expect(gedatActivityItemInfo.companyShortEle, "Expect companyShortName element to be visbile").toBeVisible();
		}
		else {
			gedatActivityItemInfo.companyShortEle = orderEle.locator("//*[contains(@class,'font-medium text-common-info')]");
			// assert when companyNameShort is null, Not available is displayed
			// expect((await gedatActivityItemInfo.companyShortEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}
	}
	
	/**
	 * 
	 * @param orderEle 
	 * @param expectedTextsInUI 
	 * @param orderData 
	 */
	async verifyColorStyleOfOrderStatus(orderEle: Locator, expectedTextsInUI: any, orderData: any) : Promise<void> {
		const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, undefined, expectedTextsInUI.completed];
	
		const isValidStatus = OrderGeneralHelper.verifyValidStatus(orderData.orderStatus);
	
		//get required content elements
		const statusEle = orderEle.getByText(
					(isValidStatus)
						? expectedStatusTexts[(orderData.orderStatus) ? orderData.orderStatus : 0]
						: expectedTextsInUI.invalidStatusEnum+"."+orderData.orderStatus
					);
		const textColorStatuses = ["rgb(45, 51, 59)", "rgb(173, 75, 9)", "rgb(5, 127, 51)", undefined, "rgb(18, 62, 138)"];
		const bgColorStatuses = ["rgb(233, 232, 245)", "rgb(255, 232, 215)", "rgb(230, 247, 239)", undefined, "rgb(218, 233, 255)"];
		const bgColor = await statusEle.evaluate(el => getComputedStyle(el).backgroundColor);
		const textColor = await statusEle.evaluate(el => getComputedStyle(el).color);
	
		// assert that the color of text and background of status label match the design
		expect(bgColor).toEqual((isValidStatus) ? bgColorStatuses[(orderData.orderStatus) ? orderData.orderStatus : 0] : bgColorStatuses[4]);
		expect(textColor).toEqual((isValidStatus) ? textColorStatuses[(orderData.orderStatus) ? orderData.orderStatus : 0] : textColorStatuses[4]);
	}
    
	/**
	 * 
	 * @param page 
	 * @param from index
	 * @param to index
	 * @param expectedTextsInUI 
	 * @param responseData 
	 */
	async verifyOrderInRange(from: number, to: number, expectedTextsInUI: any, responseData: any) : Promise<void> {
		for (let i = from; i < to; i++) {
			const orderEle = this._orderEles.nth(i);
			await orderEle.waitFor({state: 'visible'});
			if (await orderEle.locator('//gedat-activity-status//*[contains(@class,\'p-tag p-component\')]').count() == 0) {
				// assert that the number of loaded order is equal to 20, means there is no item located at position 21 and the item at position 21 is having loading effect
				expect(i).toEqual(20);
				break;
			}
			else {
				await this.verifyVisibilityOfOrder(orderEle, expectedTextsInUI, responseData.data[i]);
				await this.verifyColorStyleOfOrderStatus(orderEle, expectedTextsInUI, responseData.data[i]);
			}
		}
	}

	/**
	 * 
	 * @param page 
	 * @param n 
	 * @param orderDataInResponse 
	 * @returns 
	 */
	async getFirstNOrdersDate (n: number, orderDataInResponse: any) : Promise<string[]> {
		let dateList = [];
		for (let i = 0; i < n; i++) {
			dateList[i] = await this.getDateAtIndex(i, orderDataInResponse[i]);
		}
		return dateList;
	}

	/**
	 * get initial orders date from 0 to numberOfOrder or upperBound. If passed upperBound greater than 40, it will be set to 40.
	 * @param page 
	 * @param responseDataPage1 
	 * @param numberOfOrder 
	 * @param upperBound 
	 * @returns 
	 */
	async getInitialOrdersDateWithUpperBoundLessThanOrEqual40 (numberOfOrder: number, orderDataInResponseOfPage1: any, upperBound: number) : Promise<string[]> {
		let dateList = [];
		if (upperBound < numberOfOrder) {
			upperBound = numberOfOrder;
		}
		if (upperBound > 40) {
			upperBound = 40;
		}
		if (numberOfOrder < 20) {
			dateList = await this.getFirstNOrdersDate(numberOfOrder, orderDataInResponseOfPage1);
		}
		else {
			const _20thOrderEle = this._orderEles.nth(19);
			const response = await this.page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200,
				{timeout: 3000}
			);
			let responseDataPage2 = await response.json();
			const mergedDataFromFirst2Page = {
				data: [
					...orderDataInResponseOfPage1,
					...responseDataPage2.data
				]
			}
	
			if (numberOfOrder < upperBound) {
				dateList = await this.getFirstNOrdersDate(numberOfOrder, mergedDataFromFirst2Page.data);
			}
			else {
				dateList = await this.getFirstNOrdersDate(upperBound, mergedDataFromFirst2Page.data);
			}
		}
		return [];
	}

	/**
	 * 
	 * @param page 
	 * @param orderEle 
	 * @param orderData 
	 * @returns 
	 */
	private async getDateAtIndex (index: number, orderData: any) : Promise<string> {
		const orderEle = this._orderEles.nth(index);
		let startDateEle : Locator;
		if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
			startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
		}
		else {
			startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
		}
		return (await startDateEle.textContent())?.trim() ?? '';
	}
}

export default OrdersPage;