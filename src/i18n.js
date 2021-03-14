import {
	register,
	init,
	getLocaleFromNavigator,
	getLocaleFromPathname,
	locale as $locale,
} from 'svelte-i18n';
import { goto } from '@sapper/app';


import { setCookie, getCookie } from './modules/cookie.js';

const INIT_OPTIONS = {
	fallbackLocale: 'en',
	initialLocale: null,
	loadingDelay: 200,
	formats: {},
	warnOnMissingMessages: true,
};

let currentLocale = null;


const languages = ['en', 'pt-BR', 'es-ES', 'ar'];

languages.forEach((language) => {
	register(language, () => import(`../messages/${language}.json`));
})

const matchPath = () => window.location.pathname.match(currentLocale)
const isLanguage = (langChunk) => languages.indexOf(langChunk) !== -1


const createNewPath = () => {
	const host = window.location.host;
	const pathName = window.location.pathname;

	//split the path on "/"
	const pathArray = pathName.split('/');
	/* expected result is either going to be  ["", "pt-BR", "about"] or ["", "about"]
	to make  sure  we  don't replace  the  wrong chunk, match the first chunk to the languages array, 
	if there's no result the first chunk is not a (registered) language
	*/

	if (isLanguage(pathArray[1])) {
		pathArray[1] = currentLocale;
		return `${host}${pathArray.join('/')}`;
	}

	pathArray.splice(1, 0, currentLocale);
	return `${host}${pathArray.join('/')}`;
}


const synchPath = () => {
	// if the window is not available or the path matches our locale no update is needed.
	if (typeof window === "undefined" || matchPath()) {
		return
	}
	const newPath = createNewPath();
	goto(newPath);
	console.log(newPath)
	window.location.assign(newPath);
}

$locale.subscribe((value) => {
	if (value == null) return;

	currentLocale = value;

	// if running in the client, save the language preference in a cookie
	if (typeof window !== 'undefined') {
		setCookie('locale', value);
	}
	// after the cookie has been set, check if the routing is correct, and update the path if needed.
	synchPath()

});

// initialize the i18n library in client
export function startClient() {
	init({
		...INIT_OPTIONS,
		initialLocale:
			getCookie('locale') ||
			// getLocaleFromPathname() ||
			getLocaleFromNavigator(),
	});
}

// init only for routes (urls with no extensions such as .js, .css, etc) and for service worker
const DOCUMENT_REGEX = /(^([^.?#@]+)?([?#](.+)?)?|service-worker.*?\.html)$/;
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

		let locale = getCookie('locale', req.headers.cookie);
		// let locale = getLocaleFromPathname();

		// no cookie, let's get the first accepted language
		if (locale == null) {
			if (req.headers['accept-language']) {
				const headerLang = req.headers['accept-language'].split(',')[0].trim();
				if (headerLang.length > 1) {
					locale = headerLang;
				}
			} else {
				locale = INIT_OPTIONS.initialLocale || INIT_OPTIONS.fallbackLocale;
			}
		}

		if (locale != null && locale !== currentLocale) {
			$locale.set(locale);
		}

		next();
	};
}
