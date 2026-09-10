/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(
    `CREATE TABLE manufacturers (
    manufacturer_id    SERIAL,
    owner_id           INT NOT NULL,
    manufacturer_name  VARCHAR(100)  NOT NULL UNIQUE,
    country_code        CHAR(2),
    created_at           TIMESTAMP     DEFAULT NOW(),
    updated_at           TIMESTAMP,
    deleted_at           TIMESTAMP,

    CONSTRAINT pk_manufacturer_id PRIMARY KEY (manufacturer_id),
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFRENCES users (user_id)
);`
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE manufacturers`);
};
