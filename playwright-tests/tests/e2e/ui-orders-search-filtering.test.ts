import { expect, Locator, Page } from 'playwright/test';
import { test } from '../base';
import {
  activitiesSelectors,
	allChild,
	ordersPageSelectors,
} from '../utils/selectors';
import { appUrl } from '../utils/auth-utils';
import { loginBeforeTest } from '../common';
import mockDataOrderListPage1Pagesize20Sort4 from '../mockData/path/order/list/params/page1_pageSize20_searchKey_sort4.json' assert { type: 'json' };
import mockDataOrderListPage2Pagesize20Sort4 from '../mockData/path/order/list/params/page2_pageSize20_searchKey_sort4.json' assert { type: 'json' };

function verifyValidStatus(orderStatus : number) {
	const expectOrderStatuses = [1,2,4];
	if (!expectOrderStatuses.includes(orderStatus) && orderStatus) {//null is a valid orderStatus -> Label: "No status available"
		return false;
	}
	return true;
}

async function verifyVisibilityOfOrder(orderEle : Locator, expectedTextsInUI : any, orderData : any) {
	let gedatActivityItemInfo : {
		"statusEle": Locator | undefined,
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
		"statusEle": undefined,
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
	const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, undefined, expectedTextsInUI.completed];

	const isValidStatus = verifyValidStatus(orderData.orderStatus);

	//get required content elements
	gedatActivityItemInfo.statusEle = orderEle.getByText(
				(isValidStatus)
					? expectedStatusTexts[(orderData.orderStatus) ? orderData.orderStatus : 0]
					: expectedTextsInUI.invalidStatusEnum+"."+orderData.orderStatus
				);
	// assert that required content is visible
	expect(await gedatActivityItemInfo.statusEle.isVisible(), "Expect status element to be visbile").toBeTruthy();
	
	if (orderData.employmentStartDate) {
		if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
			gedatActivityItemInfo.startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
		}
		else {
			gedatActivityItemInfo.startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
		}
		// assert that required content is visible
		// expect(await gedatActivityItemInfo.startDateEle.isVisible(), "Expect employmentStartDate element to be visbile and the format matches design").toBeTruthy();
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
		expect(await gedatActivityItemInfo.workerNameEle.isVisible(), "Expect workerName element to be visbile").toBeTruthy();
	}
	else {
		gedatActivityItemInfo.workerNameEle = orderEle.locator("//*[@class='text-common-info-bold line-clamp-2 title ng-star-inserted']");
		// assert when employee is null or name of employee is null, "Not available" is displayed
		// expect((await gedatActivityItemInfo.workerNameEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
	}
	
	if (orderData.occupationName) {
		gedatActivityItemInfo.occupationEle = orderEle.getByText(orderData.occupationName);
		// assert that required content is visible
		expect(await gedatActivityItemInfo.occupationEle.isVisible(), "Expect occupationName element to be visbile").toBeTruthy();
	}
	else {
		gedatActivityItemInfo.occupationEle = orderEle.locator("//*[@class='text-common-label subtitle ng-star-inserted']");
		// assert when occupationName is null, Not available is displayed
		// expect((await gedatActivityItemInfo.occupationEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
	}
	
	gedatActivityItemInfo.maximumLoadPeriodTitle = orderEle.getByText(expectedTextsInUI.maxLoanPeriod);
	expect(await gedatActivityItemInfo.maximumLoadPeriodTitle.isVisible(), "Expect maxiumLoadPeriodTitle element to be visbile").toBeTruthy();
	if (orderData.maximumLoanPeriod) {
		if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
			gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
		}
		else {
			gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
		}
		// assert that required content is visible
		// expect(await gedatActivityItemInfo.maximumLoadPeriodValue.isVisible(), "Expect maxiumLoadPeriodValue element to be visbile and the format matches design").toBeTruthy();
	}
	else {
		gedatActivityItemInfo.maximumLoadPeriodValue = orderEle.locator("//*[@class='ml-1 inline-block flex-1']").nth(0);
		// assert when maximumLoanPeriodDate is null, Not available is displayed
		// expect((await gedatActivityItemInfo.maximumLoadPeriodValue.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
	}
	
	gedatActivityItemInfo.equalPayTitle = orderEle.getByText(expectedTextsInUI.equalPay);
	expect(await gedatActivityItemInfo.equalPayTitle.isVisible(), "Expect equalPayTitle element to be visbile").toBeTruthy();
	if (orderData.equalPayDate) {
		if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
			gedatActivityItemInfo.equalPayValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', { month: "short", day: "numeric", year: "numeric" }));
		}
		else {
			gedatActivityItemInfo.equalPayValue = orderEle.getByText(new Date(orderData.maximumLoanPeriod).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
		}
		// assert that required content is visible
		// expect(await gedatActivityItemInfo.equalPayValue.isVisible(), "Expect equalPayValue element to be visbile and the format matches design").toBeTruthy();
	}
	else {
		gedatActivityItemInfo.equalPayValue = orderEle.locator("//*[@class='ml-1 inline-block flex-1']").nth(1);
		// assert when equalPayDate is null, Not available is displayed
		// expect((await gedatActivityItemInfo.equalPayValue.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
	}
	
	if (orderData.companyNameShort) {
		gedatActivityItemInfo.companyShortEle = orderEle.getByText(orderData.companyNameShort);
		// assert that required content is visible
		expect(await gedatActivityItemInfo.companyShortEle.isVisible(), "Expect companyShortName element to be visbile").toBeTruthy();
	}
	else {
		gedatActivityItemInfo.companyShortEle = orderEle.locator("//*[contains(@class,'font-medium text-common-info')]");
		// assert when companyNameShort is null, Not available is displayed
		// expect((await gedatActivityItemInfo.companyShortEle.textContent())?.trim()).toContain(expectedTextsInUI.notAvailable);
	}
}

async function verifyColorStyleOfOrderStatus(orderEle : Locator, expectedTextsInUI: any, orderData : any) {
	const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, undefined, expectedTextsInUI.completed];

	const isValidStatus = verifyValidStatus(orderData.orderStatus);

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

test.describe('E2E - Orders Search And Filtering', () => {
  test.describe.configure({
    timeout: 60000,
    mode: 'serial',
  });
  test.beforeEach(async ({ page }, testInfo) => {
		console.log('Precondition 1. Login:');
		await loginBeforeTest(page);
		await page.waitForLoadState();
  });

  test('Verify Orders Search And Filtering', async ({ page, i18n }) => {
		let storeCompanyNameForStep4 = {
			companyName: '',
			companyNameShort: '',
			numberOfItem: 0,
		};
		let havingAnOccupationWithCountEqual0 = false;
		let numberOfOrder = 0;
		const expectedTextsInUI = {//object stores the texts should be displayed in UI
			ordersTitle: i18n.t("pages.activities.activityType.orders"),
			maxLoanPeriod: i18n.t("pages.activities.maxLoanPeriod"),
			equalPay: i18n.t("pages.activities.equalPay"),
			upcoming: i18n.t("pages.activities.status.enum.1"),
			active: i18n.t("pages.activities.status.enum.2"),
			completed: i18n.t("pages.activities.status.enum.4"),
			noStatusAvailable: i18n.t("pages.activities.noStatus"),
			invalidStatusEnum: "pages.activities.status.enum",
			notAvailable: i18n.t("common.notAvailable"),
			popupSortTitle: i18n.t("pages.activities.sortTitle"),
			dateAscending: i18n.t("common.sorts.options.dateAscending"),
			dateDescending: i18n.t("common.sorts.options.dateDescending"),
			applyButton: i18n.t("common.apply"),
			allCompany: i18n.t("pages.default.filters.companySelect.options.all"),
			statusFilterOption: i18n.t("pages.default.filters.statusSelect.options.all"),
			occupationFilterOption: i18n.t("pages.default.filters.occupationSelect.options.all"),
			completedOption: i18n.t("pages.activities.status.completed"),
			activeOption: i18n.t("pages.activities.status.active"),
			upcomingOption: i18n.t("pages.activities.status.upcoming"),
			doneButton: i18n.t("common.done"),
			completedStatus: i18n.t("pages.activities.status.enum.4"),
			activeStatus: i18n.t("pages.activities.status.enum.2"),
			searchPlacholder: i18n.t("common.filters.searchInput.title"),
			errorMessage: i18n.t("common.emptyFilter.desc"),
			clearFilterButton: i18n.t("common.emptyFilter.button"),
		}
    await test.step('Step 1: Click on the orders card', async () => {
			console.log('Step 1: Click on the orders card');

			await page.route('*/**/api/v1/activity/order**', async route => {
				const url = new URL(route.request().url());
				if (url.searchParams.get('page') == '1') { 
					const rawMockData = mockDataOrderListPage1Pagesize20Sort4;
					await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
				} else {
					await route.continue();
				}
			});

			const ordersCardEle = page.locator(activitiesSelectors.ordersCard);//get orders card element
			await ordersCardEle.click();//click on the orders card element
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			const responseData = await response.json();

			//assert that the title text in UI is visible
			expect(await page.locator('//gedat-activity-type-header').getByText(expectedTextsInUI.ordersTitle).isVisible()).toBeTruthy();

			for (let i = 0; i < 21; i++) {
				const orderEle = page.locator('//gedat-activity-item').nth(i);
				if (await orderEle.locator('//gedat-activity-status//*[contains(@class,\'p-tag p-component\')]').count() == 0) {
					// assert that the number of loaded order is equal to 20, means there is no item located at position 21 and the item at position 21 is having loading effect
					expect(i).toEqual(20);
					break;
				}
				else {
					await verifyVisibilityOfOrder(orderEle, expectedTextsInUI, responseData.data[i]);
					if (i < 3) {
						await verifyColorStyleOfOrderStatus(orderEle, expectedTextsInUI, responseData.data[i]);
					}
				}
			}
    });

    await test.step('Step 2: Scroll the list to the bottom', async () => {
			console.log('Step 2: Scroll the list to the bottom');

			await page.unrouteAll();
			await page.reload();
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			let responseData = await response.json();
			numberOfOrder = responseData.count;
			if (parseInt(responseData.count) > 20) {
				storeCompanyNameForStep4.companyName = responseData.data[0].companyName.trim();
				storeCompanyNameForStep4.companyNameShort = responseData?.data[0].companyNameShort.trim();
				await page.route('*/**/api/v1/activity/order**', async route => {
					const url = new URL(route.request().url());
					if (url.searchParams.get('page') == '2') {
						const rawMockData = mockDataOrderListPage2Pagesize20Sort4;
						await route.fulfill({ contentType: "application/json; charset=utf-8", body: JSON.stringify(rawMockData) });
					} else {
						await route.continue();
					}
				});

				const _20thOrderEle = page.locator('//gedat-activity-item').nth(19);
	
				await _20thOrderEle.scrollIntoViewIfNeeded();//scroll to 20th element of the order list
				const response = await page.waitForResponse(response => 
					response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
				);
				responseData = await response.json();

				const _21storderEle = page.locator('//gedat-activity-item').nth(20);
				await verifyVisibilityOfOrder(_21storderEle, expectedTextsInUI, responseData.data[0]);
				await verifyColorStyleOfOrderStatus(_21storderEle, expectedTextsInUI, responseData.data[0]);
				const _40thorderEle = page.locator('//gedat-activity-item').nth(39);
				await verifyVisibilityOfOrder(_40thorderEle, expectedTextsInUI, responseData.data[19]);
				await verifyColorStyleOfOrderStatus(_40thorderEle, expectedTextsInUI, responseData.data[19]);

				// assert that the item located at position 41 is having loading effect
				expect(await page.locator('//gedat-activity-item').nth(40).locator('//gedat-activity-status//*[contains(@class,\'p-tag p-component\')]').count()).toEqual(0);
			}
			else {
				console.log('Skip step 2 because the number of order is less than or equal to 20');
			}		
    });
    
    await test.step('Step 3: Sort date ascending', async () => {
			console.log('Step 3: Sort date ascending');

			await page.unrouteAll();

			const sortIconEle = page.locator(ordersPageSelectors.sortIconEle);//get the sort icon element
			await sortIconEle.scrollIntoViewIfNeeded();//scroll to the header title
			await page.waitForTimeout(1000);

			await sortIconEle.click();//click on the sort icon element
			const sortPopupEle = page.getByRole('dialog');
			await sortPopupEle.waitFor({state: 'visible'});

			const dateAscendingEle = sortPopupEle.getByText(expectedTextsInUI.dateAscending);//get the date ascending option element
			await dateAscendingEle.click();//click on the date ascending element

			await page.waitForTimeout(3000);

			const dateAscendingCheckIconEle = sortPopupEle.locator('//gedat-select-row[1]/i');//get the check icon element in the date ascending element
			// assert that the check icon should be displayed in the date ascending element
			expect(await dateAscendingCheckIconEle.count()).toEqual(1);

			const applyButtonEle = sortPopupEle.getByText(expectedTextsInUI.applyButton);//get the apply button element
			await applyButtonEle.click();//click on the apply button element
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			let responseDataPage1 = await response.json();
			
			let dateItemList = [];
			if (numberOfOrder < 20) {
				for (let i = 0; i < numberOfOrder; i++) {
					const orderData = responseDataPage1.data[i];
					const orderEle = page.locator('//gedat-activity-item').nth(i);
					let startDateEle;
					if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
						startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
					}
					else {
						startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
					}
					dateItemList[i] = (await startDateEle.textContent())?.trim();
				}
			}
			else {
				const _20thOrderEle = page.locator('//gedat-activity-item').nth(19);
				
				await _20thOrderEle.scrollIntoViewIfNeeded();//scroll to 20th element of the order list
				const response = await page.waitForResponse(response => 
					response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
				);
				let responseDataPage2 = await response.json();

				if (numberOfOrder < 40) {
					for (let i = 0; i < numberOfOrder; i++) {
						const orderData = (i < 20) ? responseDataPage1.data[i] : responseDataPage2.data[i - 20];
						const orderEle = page.locator('//gedat-activity-item').nth(i);
						let startDateEle;
						if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
							startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
						}
						else {
							startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
						}
						dateItemList[i] = (await startDateEle.textContent())?.trim();
					}
				}
				else {
					for (let i = 0; i < 40; i++) {
						const orderData = (i < 20) ? responseDataPage1.data[i] : responseDataPage2.data[i - 20];
						const orderEle = page.locator('//gedat-activity-item').nth(i);
						let startDateEle;
						if (process.env.ENVIRONMENT == 'STG' || process.env.ENVIRONMENT == 'PRD') {
							startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('de-DE', { day: "2-digit", month: "2-digit", year: "numeric" }));//de-DE uses dd.mm.yyyy format, is a locale identifier for German;
						}
						else {
							startDateEle = orderEle.getByText(new Date(orderData.employmentStartDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));
						}
						dateItemList[i] = (await startDateEle.textContent())?.trim();
					}
				}
			}
			console.log('Date List:', dateItemList);
			
			const dates = dateItemList
				.map(dateStr => {
					if (!dateStr) {
						return null;
					}
					const [month, day, year] = dateStr.split('/').map(Number);
					return new Date(year, month - 1, day);
				})
				.filter((date): date is Date => date != null);
			  
			// Check if the list is already sorted in ascending order
			const isSorted = dates.every((date, index) => index == 0 || date >= dates[index - 1]);
			
			expect(isSorted).toBeTruthy();
    });
    
    await test.step('Step 4: Click on the \'All Companies\' filter and filter a company', async () => {
			console.log('Step 4: Click on the \'All Companies\' filter and filter a company');

			const allCompanyFilterEle = page.getByText(expectedTextsInUI.allCompany);
			await allCompanyFilterEle.click();
			await page.waitForTimeout(1000);

			const selectCompanyNameEle = page.getByText(storeCompanyNameForStep4.companyName, { exact: true });

			await selectCompanyNameEle.click();
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			let responseData = await response.json();
			let numberOfCompany = responseData.count;
			
			//assert the company name displayed in filter is the same as the one selected
			expect((await page.locator('.truncate.ng-star-inserted').textContent())?.trim()).toEqual(storeCompanyNameForStep4.companyName);
			
			if (numberOfCompany) {
				storeCompanyNameForStep4.numberOfItem = numberOfCompany;
				if (numberOfCompany > 20) {
					numberOfCompany = 20;
				}
				for (let i = 0; i < numberOfCompany; i++) {
					const orderEle = page.locator('//gedat-activity-item').nth(i);
					const orderData = responseData.data[i];
					const companyShortEle = orderEle.getByText(orderData.companyNameShort);
					// assert that the company short name displayed in UI is the same as the one selected in filter
					expect((await companyShortEle.textContent())?.trim()).toEqual(storeCompanyNameForStep4.companyNameShort);
				}
			}
    });

    await test.step('Step 5: Click on the search bar and filter for status that leads to result', async () => {
			console.log('Step 5: Click on the search bar and filter for status that leads to result');
			
			const searchInputEle = page.getByPlaceholder(expectedTextsInUI.searchPlacholder);
			await searchInputEle.click();//click on the search icon element
			await page.waitForTimeout(1000);

			const searchFilterEle = page.locator('//*[contains(@class,\'flex items-center gap-2 overflow-x-auto ng-star-inserted\')]');
			//assert that search filter element should be visible
			expect(await searchFilterEle.isVisible()).toBeTruthy();

			let statusFilterLabelEle = page.getByText(expectedTextsInUI.statusFilterOption);//get the status filter element
			await statusFilterLabelEle.click();
			await page.waitForTimeout(1000);

			const searchFilterPopupEle = page.getByRole('dialog');
			const completedOptionEle = searchFilterPopupEle.getByText(expectedTextsInUI.completedOption);
			const activeOptionEle = searchFilterPopupEle.getByText(expectedTextsInUI.activeOption);
			let numberOfCompletedInText = (await completedOptionEle.locator('xpath=/ancestor::gedat-selectable-option//*[contains(@class,\'font-medium text-common-info-bold\')]').textContent())?.trim();
			let numberOfActiveInText = (await activeOptionEle.locator('xpath=/ancestor::gedat-selectable-option//*[contains(@class,\'font-medium text-common-info-bold\')]').textContent())?.trim();
			await completedOptionEle.click();
			await activeOptionEle.click();

			const doneButtonEle = page.getByText(expectedTextsInUI.doneButton);
			await doneButtonEle.click();
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200 &&
				response.url().includes('statuses=4&statuses=2')
			);
			let responseData = await response.json();
			
			// //assert the company name displayed in filter is the same as the one selected
			expect(await page.locator('//gedat-select-label').nth(0).getByText(storeCompanyNameForStep4.companyName).isVisible()).toBeTruthy();

			statusFilterLabelEle = page.locator('//gedat-select-label').nth(1).locator('//div[@class=\'truncate ng-star-inserted\']');
			const selectedFilterList = (await statusFilterLabelEle.textContent())?.trim();// 'Completed, Active'
			const filterArray = selectedFilterList?.split(',').map(item => item.trim()) || [];

			const expectedFilterTexts = [
				expectedTextsInUI.activeOption,
				expectedTextsInUI.completedOption
			];

			const isMatch = filterArray.length == expectedFilterTexts.length &&
			filterArray.every(item => expectedFilterTexts.includes(item));

			//assert that the selected filter is the same as which selected in filter
			expect(isMatch).toBeTruthy();

			const statusFilterEle = page.locator('//gedat-select-label').nth(1);
			const bgColor = await statusFilterEle.evaluate(el => getComputedStyle(el).backgroundColor);
			const textColor = await statusFilterEle.evaluate(el => getComputedStyle(el).color);
			//assert that the state of the status filter ele is active (background-color is rgb(50, 121, 237) and text color is rgb(255, 255, 255))
			expect(bgColor).toEqual('rgb(50, 121, 237)');
			expect(textColor).toEqual('rgb(255, 255, 255)');

			if (numberOfCompletedInText && numberOfActiveInText) {
				let numberOfCompleted = parseInt(numberOfCompletedInText);
				let numberOfActive = parseInt(numberOfActiveInText);
				let numberOfSelectedStatus = numberOfCompleted + numberOfActive;
				if (numberOfSelectedStatus > 20) {
					numberOfSelectedStatus = 20;
				}
				for (let i = 0; i < numberOfSelectedStatus; i++) {
					const orderEle = page.locator('//gedat-activity-item').nth(i);
					const orderData = responseData.data[i];
					const companyShortEle = orderEle.getByText(orderData.companyNameShort);
					// assert that the company short name displayed in UI is the same as the one selected in filter
					expect((await companyShortEle.textContent())?.trim()).toEqual(storeCompanyNameForStep4.companyNameShort);

					const expectedStatusTexts = [expectedTextsInUI.noStatusAvailable, expectedTextsInUI.upcoming, expectedTextsInUI.active, "", expectedTextsInUI.completed];
					const statusEle = orderEle.getByText(expectedStatusTexts[1]);
					// assert that the status displayed in UI is the same as the one selected in filter
					expect(await statusEle.isVisible()).toBeFalsy();
				}
			}
    });

    await test.step('Step 6: Click on the search bar and filter for status that leads to no result', async () => {
			console.log('Step 6: Click on the search bar and filter for status that leads to no result');

			const searchFilterEle = page.locator('//*[contains(@class,\'flex items-center gap-2 overflow-x-auto ng-star-inserted\')]');
			//assert that search filter element should be visible
			expect(await searchFilterEle.isVisible()).toBeTruthy();

			let occupationFilterLabelEle = page.getByText(expectedTextsInUI.occupationFilterOption);//get the occupation filter element
			await occupationFilterLabelEle.click();
			await page.waitForTimeout(1000);

			const searchFilterPopupEle = page.getByRole('dialog');
			const occupationWithCountEqual0 = searchFilterPopupEle.getByText('0');
			if (await occupationWithCountEqual0.count() > 0) {
				havingAnOccupationWithCountEqual0 = true;
				const textContentOfFirstOccupationWithCountEqual0 = (await occupationWithCountEqual0.nth(0).locator('xpath=/ancestor::gedat-selectable-option').textContent())?.trim();
				console.log(textContentOfFirstOccupationWithCountEqual0);
				const nameOfFirstOccupationWithCountEqual0 = textContentOfFirstOccupationWithCountEqual0?.slice(0, -1);
				await occupationWithCountEqual0.nth(0).click();

				const doneButtonEle = searchFilterPopupEle.getByText(expectedTextsInUI.doneButton);
				await doneButtonEle.click();
				await page.waitForTimeout(3000);
				
				// //assert the company name displayed in filter is the same as the one selected
				expect(await page.locator('//gedat-select-label').nth(0).getByText(storeCompanyNameForStep4.companyName).isVisible()).toBeTruthy();

				const statusFilterLabelEle = page.locator('//gedat-select-label').nth(1).locator('//div[@class=\'truncate ng-star-inserted\']');
	
				const selectedFilterList = (await statusFilterLabelEle.textContent())?.trim();// 'Completed, Active'
				const filterArray = selectedFilterList?.split(',').map(item => item.trim()) || [];
	
				const expectedFilterTexts = [
					expectedTextsInUI.activeOption,
					expectedTextsInUI.completedOption
				];
	
				const isMatch = filterArray.length == expectedFilterTexts.length &&
				filterArray.every(item => expectedFilterTexts.includes(item));
	
				//assert that the selected filter is the same as which selected in filter
				expect(isMatch).toBeTruthy();
	
				if (nameOfFirstOccupationWithCountEqual0) {
					//assert that the selected occupation is the same as which selected in filter
					expect(await page.locator('//gedat-select-label').nth(2).getByText(nameOfFirstOccupationWithCountEqual0).isVisible()).toBeTruthy();
				}
	
				const occupationFilterEle = page.locator('//gedat-select-label').nth(2);
				const bgColor = await occupationFilterEle.evaluate(el => getComputedStyle(el).backgroundColor);
				const textColor = await occupationFilterEle.evaluate(el => getComputedStyle(el).color);
				//assert that the state of the status filter ele is active (background-color is rgb(50, 121, 237) and text color is rgb(255, 255, 255))
				expect(bgColor).toEqual('rgb(50, 121, 237)');
				expect(textColor).toEqual('rgb(255, 255, 255)');
				
				const sorryMessageEle = page.locator("//*[normalize-space(text())=\""+expectedTextsInUI.errorMessage+"\"]");
				const clearFilterButton = page.locator('//button//*[normalize-space(text())=\''+expectedTextsInUI.clearFilterButton+'\']');
	
				//assert that the error message and the clear filter button displayed in UI is the same as the one selected in filter
				expect(await sorryMessageEle.isVisible()).toBeTruthy();
				expect(await clearFilterButton.count()).toBeTruthy();
			}
			else {
				console.log('There is no occupation with count equal 0');
			}
    });

    await test.step('Step 7: Click on the reset filter button', async () => {
			console.log('Step 7: Click on the reset filter button');

			if (havingAnOccupationWithCountEqual0 == true) {
				const clearFilterButton = page.locator('//button//*[normalize-space(text())=\''+expectedTextsInUI.clearFilterButton+'\']');
				await clearFilterButton.click();
			}
			else {
				await page.reload();
			}
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			const responseData = await response.json();

			//assert that 'All companies' is displayed in UI on the right side of search bar
			expect(await page.getByText(expectedTextsInUI.allCompany).isVisible()).toBeTruthy();

			const searchFilterEle = page.locator('//*[contains(@class,\'flex items-center gap-2 overflow-x-auto ng-star-inserted\')]');
			//assert that search filter element should be invisible
			expect(await searchFilterEle.isVisible()).toBeFalsy();

			const searchInputEle = page.getByPlaceholder(expectedTextsInUI.searchPlacholder);
			await searchInputEle.click();//click on the search icon element
			await page.waitForTimeout(1000);

			const statusFilterEle = page.locator('//gedat-select-label').nth(0);
			const statusFilterBgColor = await statusFilterEle.evaluate(el => getComputedStyle(el).backgroundColor);
			const statusFilterTextColor = await statusFilterEle.evaluate(el => getComputedStyle(el).color);
			//assert that the state of the status filter ele is active (background-color is rgb(230, 230, 230) and text color is rgb(75, 85, 99))
			expect(statusFilterBgColor).toEqual('rgb(230, 230, 230)');
			expect(statusFilterTextColor).toEqual('rgb(75, 85, 99)');

			const occupationFilterEle = page.locator('//gedat-select-label').nth(1);
			const occupationFilterBgColor = await occupationFilterEle.evaluate(el => getComputedStyle(el).backgroundColor);
			const occupationFilterTextColor = await occupationFilterEle.evaluate(el => getComputedStyle(el).color);
			//assert that the state of the status filter ele is active (background-color is rgb(230, 230, 230) and text color is rgb(75, 85, 99))
			expect(occupationFilterBgColor).toEqual('rgb(230, 230, 230)');
			expect(occupationFilterTextColor).toEqual('rgb(75, 85, 99)');

			if (numberOfOrder > 20) {
				const _1storderEle = page.locator('//gedat-activity-item').nth(0);
				await verifyVisibilityOfOrder(_1storderEle, expectedTextsInUI, responseData.data[0]);
				await verifyColorStyleOfOrderStatus(_1storderEle, expectedTextsInUI, responseData.data[0]);
				const _20thorderEle = page.locator('//gedat-activity-item').nth(19);
				await verifyVisibilityOfOrder(_20thorderEle, expectedTextsInUI, responseData.data[19]);
				await verifyColorStyleOfOrderStatus(_20thorderEle, expectedTextsInUI, responseData.data[19]);
				
				// assert that the item located at position 21 is having loading effect
				expect(await page.locator('//gedat-activity-item').nth(20).locator('//gedat-activity-status//*[contains(@class,\'p-tag p-component\')]').count()).toEqual(0);
			}
			else {
				const _1storderEle = page.locator('//gedat-activity-item').nth(0);
				await verifyVisibilityOfOrder(_1storderEle, expectedTextsInUI, responseData.data[0]);
				await verifyColorStyleOfOrderStatus(_1storderEle, expectedTextsInUI, responseData.data[0]);
				const _lastOrderEle = page.locator('//gedat-activity-item').nth(numberOfOrder - 1);
				await verifyVisibilityOfOrder(_lastOrderEle, expectedTextsInUI, responseData.data[numberOfOrder - 1]);
				await verifyColorStyleOfOrderStatus(_lastOrderEle, expectedTextsInUI, responseData.data[numberOfOrder - 1]);
			}
    });

    await test.step('Step 8: Enter value in the search bar', async () => {
			console.log('Step 8: Enter value in the search bar');
			
			const searchInputEle = page.getByPlaceholder(expectedTextsInUI.searchPlacholder);
			searchInputEle.fill(storeCompanyNameForStep4.companyNameShort);
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			let responseData = await response.json();
			let numberOfCompanyNeedToTest = (storeCompanyNameForStep4.numberOfItem > 20) ? 20 : storeCompanyNameForStep4.numberOfItem
			
			for (let i = 0; i < numberOfCompanyNeedToTest; i++) {
				const orderEle = page.locator('//gedat-activity-item').nth(i);
				const orderData = responseData.data[i];
				const companyShortEle = orderEle.getByText(orderData.companyNameShort);
				// assert that the company short name displayed in UI is the same as the one selected in filter
				expect((await companyShortEle.textContent())?.trim()).toEqual(storeCompanyNameForStep4.companyNameShort);
			}
    });

    await test.step('Step 9: Click on the x icon in the search bar', async () => {
			console.log('Step 9: Click on the x icon in the search bar');
			
			let searchInputEle = page.getByPlaceholder(expectedTextsInUI.searchPlacholder);

			const closeSearchInputIconEle = page.locator('//gedat-input-field').getByRole('button');
			await closeSearchInputIconEle.click();
			const response = await page.waitForResponse(response => 
				response.url().includes('/api/v1/activity/order?page=') && response.status() == 200
			);
			const responseData = await response.json();

			searchInputEle = page.getByPlaceholder(expectedTextsInUI.searchPlacholder);
			const searchInput = await searchInputEle.inputValue();
			expect(searchInput).toEqual('');
			
			for (let i = 0; i < 21; i++) {
				const orderEle = page.locator('//gedat-activity-item').nth(i);
				if (await orderEle.locator('//gedat-activity-status//*[contains(@class,\'p-tag p-component\')]').count() == 0) {
					// assert that the number of loaded order is equal to 20, means there is no item located at position 21 and the item at position 21 is having loading effect
					expect(i).toEqual(20);
					break;
				}
				else {
					await verifyVisibilityOfOrder(orderEle, expectedTextsInUI, responseData.data[i]);
					if (i < 3) {
						await verifyColorStyleOfOrderStatus(orderEle, expectedTextsInUI, responseData.data[i]);
					}
				}
			}
    });
  });
});
