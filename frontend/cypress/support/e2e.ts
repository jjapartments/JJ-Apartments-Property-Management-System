// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Prevent tests from failing when the reCAPTCHA script throws
// (e.g. Missing required parameters: sitekey) and provide a
// minimal grecaptcha stub before the app code runs.

// Ignore the specific grecaptcha sitekey error so tests don't fail
Cypress.on('uncaught:exception', (err) => {
	if (err && err.message && (err.message.includes('Missing required parameters: sitekey') || err.message.includes('No reCAPTCHA clients exist'))) {
		return false; // prevent Cypress from failing the test
	}
	return true; // let other errors fail the test
});

// Provide a grecaptcha stub before the page scripts execute so
// the app's call to window.grecaptcha.render() doesn't throw.
Cypress.on('window:before:load', (win) => {
	try {
		if (!win.grecaptcha) {
			(win as any).grecaptcha = {
				render: (_el: any, _opts: any) => {
					// Return a fake widget id. Do not throw if sitekey is missing.
					return 1;
				},
				getResponse: () => {
					// Return a test token so the app thinks captcha was completed
					return 'test-grecaptcha-token';
				},
				reset: () => {
					// Called after form submission; return undefined but don't error
					return undefined;
				},
				execute: () => Promise.resolve('test-grecaptcha-token'),
			};
		}
	} catch (e) {
		// Swallow any errors during stub setup to avoid blocking tests
		// (Cypress will still report other uncaught errors as configured above)
		// eslint-disable-next-line no-console
		console.warn('Failed to attach grecaptcha stub', e);
	}
});

// Also set up a global hook to ensure grecaptcha is available in all windows
if (typeof window !== 'undefined' && !window.grecaptcha) {
	(window as any).grecaptcha = {
		render: (_el: any, _opts: any) => 1,
		getResponse: () => 'test-grecaptcha-token',
		reset: () => undefined,
		execute: () => Promise.resolve('test-grecaptcha-token'),
	};
}