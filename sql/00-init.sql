CREATE EXTENSION pgcrypto;
CREATE EXTENSION btree_gist;

CREATE SCHEMA account;
DROP TABLE IF EXISTS account.user CASCADE;
DROP TABLE IF EXISTS account.role CASCADE;
DROP TABLE IF EXISTS account.user_role CASCADE;
