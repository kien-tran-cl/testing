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
  
export const activitiesSelectors = {
    headerTitle: 'gedat-home-header',
  };
  
