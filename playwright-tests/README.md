# Time Job Sales Automation

## Requirements

- Node.js 18+
- [VS Code](https://code.visualstudio.com/Download)
  - [Playwright for VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Setup

- Copy the `.env.example` file to `.env` and update the values for local testing.
- Add environment variables to GitHub Secrets for CI/CD testing as shown in the `.env.example` file.

- Install the project dependencies

```bash
npm install
```

- Install the Playwright drivers and dependencies

```bash
# All drivers (chromium, firefox, webkit)
npm run install:drivers

# Chromium (Chrome) only
npm run install:drivers:chromium

# Firefox only
npm run install:drivers:firefox

# Webkit (Safari) only
npm run install:drivers:webkit
```

## Run

- Run the test

```bash
npm run test
```

- Run the test in UI mode

```bash
npm run test:ui
```

- Record the test

```bash
npm run codegen
```

- View the test report

```bash
npm run report
```

- Checkout more commands https://playwright.dev/docs/test-cli

## Other commands

- Format the code/tests

```bash
npm run format
```

- Update project dependencies

```bash
npm run update
```

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations)
- [Playwright Emulation: Browsers for Desktop and Mobile](https://playwright.dev/docs/emulation)
- [Playwright Global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)
- [Playwright Debugging Tests](https://playwright.dev/docs/debug)
- [Playwright Test Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
