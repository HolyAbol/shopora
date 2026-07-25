/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {pgm.sql(`
    CREATE TABLE addresses (
    address_id       SERIAL,
    user_id           INT           NOT NULL,
    address_title     VARCHAR(15),
    country_code       CHAR(2)       NOT NULL,
    province           VARCHAR(20)   NOT NULL,
    city                VARCHAR(20)   NOT NULL,
    address_detail      TEXT          NOT NULL,
    postal_code         CHAR(10)      NOT NULL,
    created_at           TIMESTAMP     DEFAULT NOW(),
    updated_at           TIMESTAMP,
    deleted_at           TIMESTAMP,

    CONSTRAINT pk_address_id PRIMARY KEY (address_id),
    CONSTRAINT fk_address_user_id FOREIGN KEY (user_id) REFERENCES users (user_id)
);
`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE addresses`)};
