import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test('All forms are rendered and there is no console error', async ({ page, browserName }) => {
	let consoleErrors = 0;

	page.on('console', (msg) => {
		if (msg.type() === 'error' || msg.type() === 'warning') {
			consoleErrors++;
		}
	});

	await page.goto('/');

	// this ensures that Vue application is loaded before proceeding forward.
	await expect(page.getByText('Demo Forms')).toBeVisible();

	const forms = await page.getByText('Show').all();

	expect(forms.length).toBeGreaterThan(0);

	for (const form of forms) {
		await form.click();

		// Traverse the form element by element
		// if focused element is an editable textbox then fill it
		// Exit the loop when focus is on the Send button
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const onSendButton = await page.evaluate(() => {
				const activeElement = document.activeElement;
				return activeElement?.tagName === 'BUTTON' && activeElement.textContent === 'Send';
			});

			if (onSendButton) {
				break;
			}

			await page.keyboard.press(browserName == 'webkit' ? 'Alt+Tab' : 'Tab');

			const inputType = await page.evaluate(() => {
				const activeElement = document.activeElement as HTMLInputElement;

				if (
					activeElement?.tagName !== 'INPUT' ||
					activeElement.hasAttribute('readonly') ||
					activeElement.hasAttribute('disabled')
				) {
					return false;
				}

				return activeElement.type;
			});

			if (inputType === 'text') {
				await page.keyboard.type(faker.internet.displayName());
			} else if (inputType === 'radio') {
				await page.keyboard.press('ArrowDown');
			} else if (inputType === 'checkbox') {
				await page.keyboard.press('Space');
			}
		}

		await page.getByText('Back').click();
	}

	expect(consoleErrors).toBe(0);
});
