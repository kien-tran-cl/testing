export const loginPageSelectors = {
    title: 'title',
    logo: 'svg-icon',
    emailInput: 'input[name="identifier"]',
    continueButton: 'button:has-text("Continue")',
    warningMessage: 'p.text-common-danger',
    legalNotice: 'a:has-text("Legal Notice")',
    termsOfService: 'a:has-text("Terms of Service")',
    dataPrivacy: 'a:has-text("Data Privacy")',
    copyright: 'text=©',
  };
  
  export const loginVerificationSelectors = {
    title: 'h4:has-text("Login verification")',
    emailInfo: 'h5',
    otpInput: '.p-inputotp-input',
    resendButton: 'button:has-text("Resend")',
    submitButton: 'button:has-text("Continue")',
  };
  
  export const activitiesSelectors = {
    headerTitle: 'gedat-home-header',
  };
  