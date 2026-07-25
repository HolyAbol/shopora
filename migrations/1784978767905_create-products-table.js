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
    CREATE TABLE products (
    product_id           SERIAL,
    product_name         VARCHAR(50)  NOT NULL,
    manufacturer_id       INT          NOT NULL,
    quantity              INT          NOT NULL,
    price                  INT          NOT NULL,
    description           TEXT,
    is_active             BOOLEAN      DEFAULT true,
    created_at             TIMESTAMP    DEFAULT NOW(),
    updated_at             TIMESTAMP,
    deleted_at             TIMESTAMP,
    low_stock_threshold    INT          DEFAULT 5,

    CONSTRAINT pk_product_id PRIMARY KEY (product_id),
    CONSTRAINT fk_manufacturer_id FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id),
    CONSTRAINT chk_availability CHECK (quantity >= 0)
);

`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(`DROP TABLE products`)};
