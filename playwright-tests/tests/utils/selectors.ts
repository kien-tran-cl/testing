export const allChild = ':scope > *';

export const loginPageSelectors = {
  title: 'title',
  logo: 'svg-icon',
  emailInput: 'input[name="identifier"]',
  continueButton: 'button >> nth=0',
  emailWarningMessage: '.p-error.block.text-xs.translate-x-0',
  tenantWarningMessage: 'p.text-common-danger',
  legalNotice: 'gedat-footer > p:nth-child(1)',
  termsOfService: 'gedat-footer > p:nth-child(2)',
  dataPrivacy: 'gedat-footer > p:nth-child(3)',
  copyright: 'gedat-footer > p:nth-child(4)',
};

export const loginVerificationSelectors = {
  title: 'h4.text-common-info-bold',
  emailInfo: 'gedat-h5',
  otpInput: '.p-inputotp-input',
  otpWarningMessage: 'span.p-error',
  resendButton: 'button.p-button-text >> nth=1',
};

export const sidebarSelectors = {
sidebar: '.p-sidebar',
hamburgerIcon: 'button.p-button-icon-only',
legal: 'gedat-h5 >> nth=0',
termsOfService: 'gedat-h5 >> nth=1',
dataPrivacy: 'gedat-h5 >> nth=2',
support: 'gedat-h5 >> nth=3',
logout: 'gedat-h5 >> nth=4',
userInfoFullName: '.user-info h4',
userInfoEmail: '.user-info p',
userInfoProfileImage: '.p-sidebar gedat-avatar',
};

export const informationPagesSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-home-header',
};

export const activitiesSelectors = {
headerTitle: 'gedat-home-header',
greeting: 'gedat-h1',
userInfoProfileImage: 'gedat-avatar',
inquiriesCard: '.card-item >> nth=0',
salesActivitiesCard: '.card-item >> nth=1',
sentProfileCard: '.card-item >> nth=2',
ordersCard: '.card-item >> nth=3',
workerComplaintsCard: '.card-item >> nth=4',
billingComplaintsCard: '.card-item >> nth=5',
cardIcon: 'i[class*="icon-"]',
cardMetricNumber: 'gedat-h2',
cardTitle: 'gedat-h4',
};

export const inquiriesPageSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-header',
inquiriesItem: 'gedat-activity-item',
inquiriesSkeletonItem: 'gedat-activity-status gedat-skeleton',
status: '.p-tag',
occupation: 'h4.title',
numberOfWorker: 'p.subtitle', 
companyNameAndCity: 'p.gap-1',
date: 'p.text-common-label.min-w-10',
};

export const inquiryDetailPageSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-header',
occupation: 'gedat-activity-details >> h2', 
companyName: 'gedat-activity-details >> p',
status: 'gedat-activity-status',
inquiriesDetailItem: 'gedat-detail-item',
inquiriesDetailItemTitle: 'gedat-detail-item h5',
inquiriesDetailItemValue: 'gedat-detail-item h4',
creationDate: 'gedat-detail-item h4 >> nth=0', 
startDate: 'gedat-detail-item h4 >> nth=1',
numberOfTemporaryWorkers: 'gedat-detail-item h4 >> nth=2',
typeOfEmployment: 'gedat-detail-item h4 >> nth=3',
address: 'gedat-detail-item h4 >> nth=4',
contactPerson: 'gedat-detail-item h4 >> nth=5 >> span',
runningNumber: 'gedat-detail-item h4 >> nth=6',
};

export const contactDetailPage = {
backArrow: 'button.p-button-icon-only >> nth=0',
name: 'gedat-contact-details h2',
title: '',
};

export const salesActivitiesPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
  itemcount: 'gedat-dialog-sort p',
  gedatActivitiesEle: 'gedat-activities',//ele
  salesActivitiesItem: 'gedat-activity-item',
  salesActivitiesSkeletonItem: 'gedat-activity-status gedat-skeleton',
  status: '.p-tag',
  title: 'h4.text-common-info-bold.title',
  contactPerson: 'p.text-common-label.subtitle',
  companyName: 'p.gap-1',
  date: 'p.text-common-label.min-w-10', 
};

export const salesActivitiesDetailsSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',

  itemTitle: 'gedat-h2 h2',//ele ele
  itemCompanyName: 'p.text-common-info span.w-max.cursor-pointer',
  itemStatus: 'gedat-activity-status span',//ele ele
  itemCreated: 'gedat-detail-item >> nth=0',//1st ele
  itemFollowUp: 'gedat-detail-item >> nth=1',//2nd ele
  itemKind: 'gedat-detail-item >> nth=2',//3rd ele
  itemContactPerson: 'gedat-detail-item >> nth=3',//4th ele
  itemReporters: 'gedat-detail-item >> nth=4',//5th ele
  itemForwardedTo: 'gedat-detail-item >> nth=5',//6th ele
};

export const contactDetailSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',

  contactName: '.min-w-12.ng-star-inserted',
}

export const sentProfilePageSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-header',
itemCount: 'gedat-dialog-sort p',
profileItem: 'gedat-activity-item',
profileSkeletonItem: 'gedat-activity-status gedat-skeleton',
status: '.p-tag',
workerName: 'h4',
occupation: 'p.subtitle',
companyName: 'p.font-medium.text-common-info',
date: 'p.text-common-label.min-w-10',
downloadButton: 'p-button[size="small"][icon="icon-solid-file-attachment-01"] button',
};

export const ordersPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
  itemCount: 'gedat-dialog-sort p',
  sortIconEle: '.icon-switch-vertical-02.text-xl',//class chain
  ordersItem: 'gedat-activity-item',
  ordersSkeletonItem: 'gedat-activity-status gedat-skeleton',
  status: '.p-tag',
  workerName: 'h4.text-common-info-bold',
  occupation : 'p.subtitle',
  maximumLoanPeriod: '.text-item .flex.items-center:first-of-type',
  equalPayDate: '.text-item .flex.items-center:last-of-type',
  companyName: 'p.gap-1',
  date: 'p.text-common-label.min-w-10',
};


export const workerComplaintsPageSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-header',
itemCount: 'gedat-dialog-sort p',
workerComplaintItem: 'gedat-activity-item',
workerComplaintSkeletonItem: 'gedat-activity-status gedat-skeleton',
status: '.p-tag',
title: 'h4.text-common-info-bold.title',
contactPerson: 'p.text-common-label.subtitle',
companyName: 'p.gap-1',
date: 'p.text-common-label.min-w-10',
};

export const billingComplaintsPageSelectors = {
backArrow: 'button.p-button-icon-only >> nth=0',
headerTitle: 'gedat-header',
itemCount: 'gedat-dialog-sort p',
billingComplaintItem: 'gedat-activity-item',
billingComplaintSkeletonItem: 'gedat-activity-status gedat-skeleton',
status: '.p-tag',
title: 'h4.text-common-info-bold.title',
contactPerson: 'p.text-common-label.subtitle',
companyName: 'p.gap-1',
date: 'p.text-common-label.min-w-10',
};

export const searchFilter = {
inputField: 'gedat-input-field >> input',
clearInputField: 'gedat-input-field >> button',
cancelSearch: 'p-button[gedatresetfilter] button',
clientFilter: 'gedat-company-filter',
clientFilterText: 'gedat-label >> div >> nth=0',
multiselectFilter: 'gedat-select-label',
multiselectFilterText: 'gedat-select-label label',
filterFormOverlay: 'role=dialog',
filterOptions: 'gedat-selectable-option',
companyFilterCount: "gedat-selectable-option div.grid p",
companyFilterLabel: "gedat-selectable-option p.flex-1",
closeFilter: 'gedat-close-button-dialog-form',
emptyFilterMessage: 'gedat-empty-filtering >> div >> div >> nth=1',
emptyFilterResetButton: 'gedat-empty-filtering button',
statusFilterCount: "gedat-selectable-option div.grid p",
statusFilterLabel: 'gedat-selectable-option > p',
};

export const dialogSort = {
sortIcon: 'gedat-dialog-sort >> i',
sortText: 'gedat-dialog-sort p',
dialogSort: 'role=dialog',
sortOptions: 'gedat-select-row',
dateAscending: 'gedat-select-row>>nth=0',
dateDescending: 'gedat-select-row>>nth=1',
iconCheck: '.icon-check',
applyButton: "div[role='dialog'] .p-dialog-content .p-button-primary",
};