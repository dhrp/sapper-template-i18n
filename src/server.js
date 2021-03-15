import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { i18nMiddleware } from './i18n.js';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka()
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		i18nMiddleware(),
		sapper.middleware({
			session: (req, res) => ({
				locale: req.locale, // value from i18Middleware
			}),
		})
	)
	.listen(PORT, (err) => {
		if (err) console.log('error', err);
	});
