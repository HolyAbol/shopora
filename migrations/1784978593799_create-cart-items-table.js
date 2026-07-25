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
    CREATE TABLE cart_items (
    cart_id       INT,
    product_id     INT,
    quantity        INT   NOT NULL,
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT pk_cart_item PRIMARY KEY (cart_id, product_id),
    CONSTRAINT fk_cart_item FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE cart items`)};
