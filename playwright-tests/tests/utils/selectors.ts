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
  userInfoProfileImage: '.p-sidebar .p-avatar-image',
};

export const informationPagesSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-home-header',
};
  
export const activitiesSelectors = {
  headerTitle: 'gedat-home-header',
  greeting: 'gedat-h1',
  userInfoProfileImage: '.p-avatar-image',
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
};

export const salesActivitiesPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
};

export const sentProfilePageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
};

export const ordersPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
};

export const workerComplaintsPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
};

export const billingComplaintsPageSelectors = {
  backArrow: 'button.p-button-icon-only >> nth=0',
  headerTitle: 'gedat-header',
};
