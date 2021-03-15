export function getCookie(name, cookies) {
	if (cookies == null) {
		if (typeof window === 'undefined') {
			return undefined;
		}
		cookies = document.cookie;
	}

	const kv = cookies.split(';').find((part) => part.trim().startsWith(name));

	if (!kv) return undefined;

	const cookieValue = kv.split('=')[1];
	if (!cookieValue) return undefined;

	return decodeURIComponent(cookieValue.trim());
}

export function setCookie(name, value, options = {}) {
	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	console.log('cookie.options', options);

	let updatedCookie = {
		[encodeURIComponent(name)]: encodeURIComponent(value),
		sameSite: 'strict',
		...options,
	};

	console.log(
		'cookie.string',
		Object.entries(updatedCookie)
			.map((kv) => kv.join('='))
			.join(';')
	);

	document.cookie = Object.entries(updatedCookie)
		.map((kv) => kv.join('='))
		.join(';');
}
