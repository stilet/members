const polka = require('polka')
const { postgraphile } = require("postgraphile")
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const {
  PORT = 3000,
  DATABASE_URL = 'postgres://postgres:mysecretpassword@members-postgres-1.dev.dock/wolbodo',
  NODE_ENV,
} = process.env


polka() // You can also use Express
.use(
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
  )
)
.listen(PORT, err => {
  if (err) console.log('error', err);
});
