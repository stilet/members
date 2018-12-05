CREATE TABLE account.user (
  id                INTEGER             GENERATED ALWAYS AS IDENTITY,
  name              VARCHAR(255)        NOT NULL,
  email             VARCHAR(1024)       ,
  password          VARCHAR(1024)       ,
  fullname          VARCHAR(1024)       NOT NULL,
  phone             VARCHAR(255)        ,
  streetname        VARCHAR(1024)       ,
  housenumber       NUMERIC(8,0)        ,
  housenumberaddon  VARCHAR(255)        ,
  zipcode           VARCHAR(255)        ,
  city              VARCHAR(255)        ,
  country           VARCHAR(255)        ,
  validity          TSTZRANGE           NOT NULL,
  modified          TIMESTAMPTZ         DEFAULT 'NOW',

  EXCLUDE USING gist (name WITH =, validity WITH &&),
  PRIMARY KEY(name, validity),
  UNIQUE(id),
  CONSTRAINT is_email CHECK (email ~ '^[^@]+@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+(xn--[a-zA-Z0-9-]{4,}|[a-zA-Z]{2,})$')
);
CREATE INDEX ON account.user (email);
-- TODO: how to add EXCLUDE USING gist (email WITH =, validity WITH &&) ?

CREATE TABLE account.role (
  id                INTEGER             GENERATED ALWAYS AS IDENTITY,
  name              VARCHAR(1024)       NOT NULL,
  description       TEXT                NOT NULL,
  validity          TSTZRANGE           NOT NULL,
  modified          TIMESTAMPTZ         DEFAULT 'NOW',

  EXCLUDE USING gist (name WITH =, validity WITH &&),
  PRIMARY KEY(name, validity), 
  UNIQUE(id)
);

CREATE TABLE account.user_role (
  user_id          INTEGER             NOT NULL REFERENCES account.user(id),
  role_id          INTEGER             NOT NULL REFERENCES account.role(id),
  note             TEXT                NOT NULL DEFAULT '',
  validity         TSTZRANGE           NOT NULL,
  modified         TIMESTAMPTZ         DEFAULT 'NOW',

  EXCLUDE USING gist (user_id WITH =, role_id WITH =, validity WITH &&),
  PRIMARY KEY(user_id, role_id, validity)
);