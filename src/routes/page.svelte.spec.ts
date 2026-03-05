import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the analog photo inspector board', async () => {
		render(Page);

		const polaroid = page.getByText('Sector 4 - Breach');
		await expect.element(polaroid).toBeInTheDocument();
	});
});
