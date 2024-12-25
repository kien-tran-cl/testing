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
  backIcon: 'button.p-button-icon-only >> nth=0',
};
  
export const activitiesSelectors = {
    headerTitle: 'gedat-home-header',
};
