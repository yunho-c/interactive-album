import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const PREFERENCES_STORAGE_KEY = 'interactive-album.preferences.v1';

export interface AppPreferences {
	inspectDragSensitivity: number;
	hoverRotateJitter: number;
	supersplatHideUi: boolean;
	supersplatAntialias: boolean;
	closeOnBackdropClick: boolean;
}

export interface AppState {
	inspectedId: number | null;
	hoverId: number | null;
	hoverOffsets: Record<number, number>;
	preferences: AppPreferences;
}

const defaultPreferences: AppPreferences = {
	inspectDragSensitivity: 0.6,
	hoverRotateJitter: 2,
	supersplatHideUi: true,
	supersplatAntialias: true,
	closeOnBackdropClick: true
};

const initialState: AppState = {
	inspectedId: null,
	hoverId: null,
	hoverOffsets: {},
	preferences: defaultPreferences
};

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseStoredPreferences = (): AppPreferences => {
	if (!browser) {
		return defaultPreferences;
	}

	try {
		const rawValue = localStorage.getItem(PREFERENCES_STORAGE_KEY);
		if (!rawValue) {
			return defaultPreferences;
		}

		const parsed = JSON.parse(rawValue) as Partial<AppPreferences>;
		return {
			inspectDragSensitivity:
				typeof parsed.inspectDragSensitivity === 'number'
					? clampNumber(parsed.inspectDragSensitivity, 0.2, 1.6)
					: defaultPreferences.inspectDragSensitivity,
			hoverRotateJitter:
				typeof parsed.hoverRotateJitter === 'number'
					? clampNumber(parsed.hoverRotateJitter, 0, 8)
					: defaultPreferences.hoverRotateJitter,
			supersplatHideUi:
				typeof parsed.supersplatHideUi === 'boolean'
					? parsed.supersplatHideUi
					: defaultPreferences.supersplatHideUi,
			supersplatAntialias:
				typeof parsed.supersplatAntialias === 'boolean'
					? parsed.supersplatAntialias
					: defaultPreferences.supersplatAntialias,
			closeOnBackdropClick:
				typeof parsed.closeOnBackdropClick === 'boolean'
					? parsed.closeOnBackdropClick
					: defaultPreferences.closeOnBackdropClick
		};
	} catch (error) {
		console.warn('Failed to parse saved preferences, using defaults.', error);
		return defaultPreferences;
	}
};

const persistPreferences = (preferences: AppPreferences) => {
	if (!browser) {
		return;
	}

	localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
};

const createAppStore = () => {
	const { subscribe, update } = writable<AppState>({
		...initialState,
		preferences: parseStoredPreferences()
	});

	const setPreference = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
		update((state) => {
			const preferences = {
				...state.preferences,
				[key]: value
			};
			persistPreferences(preferences);
			return {
				...state,
				preferences
			};
		});
	};

	return {
		subscribe,
		openInspection: (photoId: number) => {
			update((state) => ({
				...state,
				inspectedId: photoId
			}));
		},
		closeInspection: () => {
			update((state) => ({
				...state,
				inspectedId: null,
				hoverId: null
			}));
		},
		setHover: (photoId: number, offset: number) => {
			update((state) => ({
				...state,
				hoverId: photoId,
				hoverOffsets: {
					...state.hoverOffsets,
					[photoId]: offset
				}
			}));
		},
		clearHover: () => {
			update((state) => ({
				...state,
				hoverId: null
			}));
		},
		setPreference,
		resetPreferences: () => {
			persistPreferences(defaultPreferences);
			update((state) => ({
				...state,
				preferences: defaultPreferences
			}));
		}
	};
};

export const appStore = createAppStore();
