import { test, expect } from '@playwright/test';
import { activitiesSelectors } from '../utils/selectors';
import { UI } from '../utils';
import { login, verifyOtp } from '../common';

const { USER_EMAIL } = process.env;

test.describe('E2E Tests  - Login Page', () => {
  test.describe.configure({
    timeout: 60000,
    mode: 'serial',
  });

  test('verify login successfully with valid email and otp', async ({ page }) => {
    console.log('USER_EMAIL:', USER_EMAIL);

    if (!USER_EMAIL) {
      throw new Error('USER_EMAIL is not defined in environment variables');
    }
    // Step 1: Fill in valid email
    await login(page, USER_EMAIL);
    await page.waitForTimeout(5000);

    // Step 2: Fill in valid OTP
    await verifyOtp(page, USER_EMAIL);

    // Step 3: Verify successful login, navigate to Activities page
    await page.waitForSelector(activitiesSelectors.headerTitle, {
      state: 'visible',
    });

    const activitiesTitle = await page.textContent(
      activitiesSelectors.headerTitle,
    );
    expect(activitiesTitle).toContain('Activities');
  });
});
