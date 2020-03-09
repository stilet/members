import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'
import { postgraphile } from 'postgraphile'

const {
	PORT,
	NODE_ENV,
  DATABASE_URL = 'postgres://postgres:mysecretpassword@members-postgres-1.web.dock/wolbodo',
} = process.env
const dev = NODE_ENV === 'development'

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		postgraphile(
			DATABASE_URL,
			"public",
			{
				subscriptions: true,
				watchPg: true,
				dynamicJson: true,
				setofFunctionsContainNulls: false,
				ignoreRBAC: false,
				ignoreIndexes: false,
				showErrorStack: "json",
				extendedErrors: ["hint", "detail", "errcode"],
				appendPlugins: [
					require("@graphile-contrib/pg-simplify-inflector")
				],
				exportGqlSchemaPath: "schema.graphql",
				graphiql: true,
				enhanceGraphiql: true,
				allowExplain(req) {
					// TODO: customise condition!
					return true;
				},
				enableQueryBatching: true,
				legacyRelations: "omit",
				pgSettings(req) {
					/* TODO */
				},
			}
		),
		sapper.middleware(),
	)
	.listen(PORT, err => {
		if (err) console.log('error', err)
	})
