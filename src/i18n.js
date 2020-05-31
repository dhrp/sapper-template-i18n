import {
	register,
	init,
	getLocaleFromNavigator,
	locale as $locale,
} from 'svelte-i18n';

import { setCookie, getCookie } from './modules/cookie.js';

const INIT_OPTIONS = {
	fallbackLocale: 'en',
	initialLocale: null,
	loadingDelay: 200,
	formats: {},
	warnOnMissingMessages: true,
};

let currentLocale = null;

register('en', () => import('../messages/en.json'));
register('pt-BR', () => import('../messages/pt-BR.json'));
register('es-ES', () => import('../messages/es-ES.json'));
register('ar', () => import('../messages/ar.json'));

$locale.subscribe((value) => {
	if (value == null) return;

	currentLocale = value;

	// if running in the client, save the language preference in a cookie
	if (typeof window !== 'undefined') {
		setCookie('locale', value);
	}
});

// initialize the i18n library in client
export function startClient() {
	init({
		...INIT_OPTIONS,
		initialLocale: getCookie('locale') || getLocaleFromNavigator(),
	});
}

const DOCUMENT_REGEX = /^([^.?#@]+)?([?#](.+)?)?$/;
// initialize the i18n library in the server and returns its middleware
export function i18nMiddleware() {
	// initialLocale will be set by the middleware
	init(INIT_OPTIONS);

	return (req, res, next) => {
		const isDocument = DOCUMENT_REGEX.test(req.originalUrl);
		// get the initial locale only for a document request
		if (!isDocument) {
			next();
			return;
		}

		let lang = getCookie('locale', req.headers.cookie);

		// no cookie, let's get the first accepted language
		if (lang == null) {
			const headerLang = req.headers['accept-language'].split(',')[0].trim();
			if (headerLang.length > 1) {
				lang = headerLang;
			}
		}

		if (lang != null && lang !== currentLocale) {
			$locale.set(lang);
		}

		next();
	};
}
