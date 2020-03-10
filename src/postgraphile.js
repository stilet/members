import { postgraphile } from 'postgraphile'

import simplifyInflector from '@graphile-contrib/pg-simplify-inflector'
import connectionFilter from 'postgraphile-plugin-connection-filter'

const {
  DATABASE_URL = 'postgres://postgres:mysecretpassword@members-postgres-1.web.dock/wolbodo',
} = process.env

export default postgraphile(
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
      simplifyInflector,
      connectionFilter
    ],
    exportGqlSchemaPath: "schema.graphql",
    graphiql: true,
    enhanceGraphiql: true,
    allowExplain(req) {
      // TODO: customise condition!
      return true;
    },
    jwtSecret: 'secret',
    jwtPgTypeIdentifier: 'public.jwt_token',
    enableQueryBatching: true,
    legacyRelations: "omit",
    pgSettings(req) {
      /* TODO */
    },
  }
)