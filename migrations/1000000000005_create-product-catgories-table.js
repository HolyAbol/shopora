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
    CREATE TABLE product_categories (
    product_id     INT   NOT NULL,
    category_id    INT   NOT NULL,
    deleted_at      TIMESTAMP,

    CONSTRAINT pk_product_categories PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_product_id FOREIGN KEY (product_id)
        REFERENCES products (product_id),
    CONSTRAINT fk_category_id FOREIGN KEY (category_id)
        REFERENCES categories (category_id)
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE product_categories`)}
