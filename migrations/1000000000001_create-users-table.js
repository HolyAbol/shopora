export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
    user_id         SERIAL,
    username        VARCHAR(30)  NOT NULL,
    password        VARCHAR(60)  NOT NULL,
    email           VARCHAR(254) NOT NULL,
    phone_number    VARCHAR(11)  NOT NULL,
    first_name      VARCHAR(20),
    last_name       VARCHAR(20),
    role            VARCHAR(10)  NOT NULL DEFAULT 'user',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    deleted_at      TIMESTAMP,
    last_activity   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_user_id PRIMARY KEY (user_id),
    CONSTRAINT chk_role CHECK (role IN ('user', 'admin', 'owner'))
);

CREATE UNIQUE INDEX users_username_unique_active
    ON users (username)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX users_email_unique_active
    ON users (email)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX users_phone_number_unique_active
    ON users (phone_number)
    WHERE deleted_at IS NULL;
        `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE users`);
};
