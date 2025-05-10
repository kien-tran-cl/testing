import { Page, expect, Locator } from '@playwright/test';
import OrderGeneralHelper from '../../orderGeneralHelper';
import OrderDetailHelper from './orderDetailPageHelper';

class OrderDetailPage extends OrderDetailHelper {
	private readonly _orderDetail: Locator;

	private readonly _startDateItem: Locator;
	private readonly _endDateItem: Locator;
	private readonly _occupationItem: Locator;
	private readonly _equalPayItem: Locator;
	private readonly _maximumLoanPeriodItem: Locator;
	private readonly _orderNumberItem: Locator;

	constructor(page: Page) {
		super(page);
		this._orderDetail = this.page.locator('gedat-activity-details');
		this._startDateItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-play')});
		this._endDateItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-stop')});
		this._occupationItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-certificate-01')});
		this._equalPayItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-scales-02')});
		this._maximumLoanPeriodItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-lock-01')});
		this._orderNumberItem = this._orderDetail.locator('gedat-detail-item', {has: this.page.locator('.icon-book-open-02')});
	}

	/**
	 * 
	 * @param expectedTextsInUI 
	 * @param orderData 
	 */
	async verifyVisibilityOfOrderDetail(expectedTextsInUI: any, orderData: any) {
		const isValidStatus = OrderGeneralHelper.verifyValidStatus(orderData.orderStatus);
		const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, undefined, expectedTextsInUI.completed];
		let gedatActivityDetailInfo : {
			"statusEle": Locator,
			"workerNameEle": Locator | undefined,
			"companyEle": Locator | undefined,
			"startDateTitle": Locator | undefined,
			"startDateValue": Locator | undefined,
			"endDateTitle": Locator | undefined,
			"endDateValue": Locator | undefined,
			"occupationTitle": Locator | undefined,
			"occupationValue": Locator | undefined,
			"equalPayTitle": Locator | undefined,
			"equalPayValue": Locator | undefined,
			"maximumLoadPeriodTitle": Locator | undefined,
			"maximumLoadPeriodValue": Locator | undefined,
			"orderNumberTitle": Locator | undefined,
			"orderNumberValue": Locator | undefined,
		} = {
			"statusEle": this._orderDetail.getByText(
				(isValidStatus)
					? expectedStatusTexts[(orderData.orderStatus) ? orderData.orderStatus : 0]
					: expectedTextsInUI.invalidStatusEnum+"."+orderData.orderStatus
				),
			"workerNameEle": undefined,
			"companyEle": undefined,
			"startDateTitle": undefined,
			"startDateValue": undefined,
			"endDateTitle": undefined,
			"endDateValue": undefined,
			"occupationTitle": undefined,
			"occupationValue": undefined,
			"equalPayTitle": undefined,
			"equalPayValue": undefined,
			"maximumLoadPeriodTitle": undefined,
			"maximumLoadPeriodValue": undefined,
			"orderNumberTitle": undefined,
			"orderNumberValue": undefined,
		};

		// assert that required content is visible
		await expect(gedatActivityDetailInfo.statusEle, "Expect status element to be visbile").toBeVisible();

		if ((orderData.employee) && (orderData.employee.givenName || orderData.employee.surname)) {
			gedatActivityDetailInfo.workerNameEle = this._orderDetail.getByText((
					((orderData.employee.title) ? orderData.employee.title + ' ' : '')
				+ ((orderData.employee.givenName) ? orderData.employee.givenName + ' ' : '')
				+ ((orderData.employee.surname) ? orderData.employee.surname : '')).trim());
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.workerNameEle, "Expect workerName element to be visbile").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.workerNameEle = this._orderDetail.nth(0).locator("//*[contains(@class,'text-common-info-bold')]//h2");
			// assert when employee is null or name of employee is null, "Not available" is displayed
			// expect((await gedatActivityItemInfo.workerNameEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}

		if (orderData.customer && orderData.customer.companyName) {
			gedatActivityDetailInfo.companyEle = this._orderDetail.getByText(orderData.customer.companyName);
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.companyEle, "Expect companyName element to be visbile").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.companyEle = this._orderDetail.nth(0).locator("//*[contains(@class,'font-medium text-common-info')]");
			// assert when companyName is null, Not available is displayed
			// expect((await gedatActivityItemInfo.companyEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
		}

		gedatActivityDetailInfo.startDateTitle = this._startDateItem.getByText(expectedTextsInUI.startDate);
		await expect(gedatActivityDetailInfo.startDateTitle, "Expect startDateTitle element to be visbile").toBeVisible();
		if (orderData.employmentStartDate) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				gedatActivityDetailInfo.startDateValue = this._startDateItem.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
			}
			else {
				gedatActivityDetailInfo.startDateValue = this._startDateItem.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.startDateValue, "Expect employmentStartDate element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.startDateValue = this._startDateItem.locator("h4.text-common-info-bold");
			// assert when employmentStartDate is null, Not available is displayed
			await expect(gedatActivityDetailInfo.startDateValue, "Expect employmentStartDate element to be visbile and the format matches design").toBeVisible();
		}
		
		gedatActivityDetailInfo.endDateTitle = this._endDateItem.getByText(expectedTextsInUI.endDate);
		await expect(gedatActivityDetailInfo.endDateTitle, "Expect endDateTitle element to be visbile").toBeVisible();
		if (orderData.employmentEndDate) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				gedatActivityDetailInfo.endDateValue = this._endDateItem.getByText(new Date(orderData.employmentEndDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
			}
			else {
				gedatActivityDetailInfo.endDateValue = this._endDateItem.getByText(new Date(orderData.employmentEndDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.endDateValue, "Expect employmentEndDate element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.endDateValue = this._endDateItem.locator("h4.text-common-info-bold");
			// assert when employmentEndDate is null, Not available is displayed
			expect((await gedatActivityDetailInfo.endDateValue.textContent())?.trim(), "Expect employmentEndDate element to be visbile and display 'Not available'").toContain(expectedTextsInUI.notAvailable);
		}

		gedatActivityDetailInfo.occupationTitle = this._occupationItem.getByText(expectedTextsInUI.occupation);
		await expect(gedatActivityDetailInfo.occupationTitle, "Expect occupationTitle element to be visbile").toBeVisible();
		if (orderData.occupation && orderData.occupation.name) {
			gedatActivityDetailInfo.occupationValue = this._occupationItem.getByText(orderData.occupation.name);
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.occupationValue, "Expect occupation element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.occupationValue = this._occupationItem.locator("h4.text-common-info-bold");
			// assert when occupation is null, Not available is displayed
			expect((await gedatActivityDetailInfo.occupationValue.textContent())?.trim(), "Expect occupation element to be visbile and display 'Not available'").toContain(expectedTextsInUI.notAvailable);
		}

		gedatActivityDetailInfo.equalPayTitle = this._equalPayItem.getByText(expectedTextsInUI.equalPay);
		await expect(gedatActivityDetailInfo.equalPayTitle, "Expect equalPayTitle element to be visbile").toBeVisible();
		if (orderData.equalPayDate) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				// gedatActivityDetailInfo.equalPayValue = this._equalPayItem.getByText(new Date(orderData.equalPayDate).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
				gedatActivityDetailInfo.equalPayValue = this._equalPayItem.getByText(new Date(orderData.equalPayDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
			}
			else {
				gedatActivityDetailInfo.equalPayValue = this._equalPayItem.getByText(new Date(orderData.equalPayDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.equalPayValue, "Expect equalPayValue element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.equalPayValue = this._equalPayItem.locator('h4.text-common-info-bold');
			// assert when equalPay is null, Not available is displayed
			expect((await gedatActivityDetailInfo.equalPayValue.textContent())?.trim(), "Expect equalPay element to be visbile and display 'Not available'").toContain(expectedTextsInUI.notAvailable);
		}

		gedatActivityDetailInfo.maximumLoadPeriodTitle = this._maximumLoanPeriodItem.getByText(expectedTextsInUI.maxLoanPeriod);
		await expect(gedatActivityDetailInfo.maximumLoadPeriodTitle, "Expect maximumLoadPeriodTitle element to be visbile").toBeVisible();
		if (orderData.maximumLoanPeriod) {
			if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
				// gedatActivityDetailInfo.maximumLoadPeriodValue = this._maximumLoanPeriodItem.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
				gedatActivityDetailInfo.maximumLoadPeriodValue = this._maximumLoanPeriodItem.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
			}
			else {
				gedatActivityDetailInfo.maximumLoadPeriodValue = this._maximumLoanPeriodItem.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
			}
			// assert that required content is visible
			await expect(gedatActivityDetailInfo.maximumLoadPeriodValue, "Expect maxiumLoadPeriodValue element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.maximumLoadPeriodValue = this._maximumLoanPeriodItem.locator('h4.text-common-info-bold');
			// assert when maximumLoanPeriodDate is null, Not available is displayed
			expect((await gedatActivityDetailInfo.maximumLoadPeriodValue.textContent())?.trim(), "Expect maximumLoadPeriod element to be visbile and display 'Not available'").toContain(expectedTextsInUI.notAvailable);
		}

		gedatActivityDetailInfo.orderNumberTitle = this._orderNumberItem.getByText(expectedTextsInUI.orderNumber);
		await expect(gedatActivityDetailInfo.orderNumberTitle, "Expect orderNumberTitle element to be visbile").toBeVisible();
		if (orderData.orderNumber) {
			// assert that required content is visible
			gedatActivityDetailInfo.orderNumberValue = this._orderNumberItem.getByText(orderData.orderNumber);
			await expect(gedatActivityDetailInfo.orderNumberValue, "Expect orderNumber element to be visbile and the format matches design").toBeVisible();
		}
		else {
			gedatActivityDetailInfo.orderNumberValue = this._orderNumberItem.locator("h4.text-common-info-bold");
			// assert when orderNumber is null, Not available is displayed
			expect((await gedatActivityDetailInfo.orderNumberValue.textContent())?.trim(), "Expect orderNumber element to be visbile and display 'Not available'").toContain(expectedTextsInUI.notAvailable);
		}
	}
}

export default OrderDetailPage;