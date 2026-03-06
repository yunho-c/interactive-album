import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { appStore } from './app-store';

describe('appStore', () => {
	it('tracks inspect and hover state', () => {
		appStore.openInspection(4);
		appStore.setHover(4, 1.25);

		const state = get(appStore);
		expect(state.inspectedId).toBe(4);
		expect(state.hoverId).toBe(4);
		expect(state.hoverOffsets[4]).toBe(1.25);

		appStore.closeInspection();
		expect(get(appStore).inspectedId).toBeNull();
	});

	it('updates and resets preferences', () => {
		appStore.setPreference('inspectDragSensitivity', 1.1);
		appStore.setPreference('supersplatHideUi', false);

		let state = get(appStore);
		expect(state.preferences.inspectDragSensitivity).toBe(1.1);
		expect(state.preferences.supersplatHideUi).toBe(false);

		appStore.resetPreferences();
		state = get(appStore);
		expect(state.preferences.inspectDragSensitivity).toBe(0.6);
		expect(state.preferences.supersplatHideUi).toBe(true);
	});
});
