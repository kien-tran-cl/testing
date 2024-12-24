export const loginPageSelectors = {
    title: 'title',
    logo: 'svg-icon',
    emailInput: 'input[name="identifier"]',
    continueButton: 'button:has-text("Continue")',
    emailWarningMessage: '.p-error.block.text-xs.translate-x-0',
    tenantWarningMessage: 'p.text-common-danger',
    legalNotice: 'a:has-text("Legal Notice")',
    termsOfService: 'a:has-text("Terms of Service")',
    dataPrivacy: 'a:has-text("Data Privacy")',
    copyright: 'text=©',
  };
  
export const loginVerificationSelectors = {
    title: 'h4:has-text("Login verification")',
    emailInfo: 'h5',
    otpInput: '.p-inputotp-input',
    otpWarningMessage: 'span.p-error',
    resendButton: 'button:has-text("Resend")',
  };

export const sidebarSelectors = {
  sidebar: '.p-sidebar',
  hamburgerIcon: 'button.p-button-icon-only',
  legal: 'div:has-text("Legal notice") >> nth=4',
  termsOfService: 'div:has-text("Terms of services") >> nth=4',
  dataPrivacy: 'div:has-text("Data privacy policy") >> nth=4',
  support: 'div:has-text("Support") >> nth=4',
  logout: 'div:has-text("Logout") >> nth=4',
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
  
