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
    CREATE TABLE categories (
    category_id           SERIAL,
    category_name         VARCHAR(50),
    category_parent_id    INT,
    created_at             TIMESTAMP    DEFAULT NOW(),
    updated_at             TIMESTAMP,
    deleted_at             TIMESTAMP,

    CONSTRAINT pk_category_id PRIMARY KEY (category_id),
    CONSTRAINT fk_category_parent_id FOREIGN KEY (category_parent_id)
        REFERENCES categories (category_id)
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE categories`)};
