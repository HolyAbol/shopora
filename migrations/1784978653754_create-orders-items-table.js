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
    CREATE TABLE order_items (
    order_id       INT,
    product_id      INT,
    quantity         INT   NOT NULL,
    unit_price        INT   NOT NULL,
    deleted_at         TIMESTAMP,

    CONSTRAINT pk_order_item PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT chk_order_quantity CHECK (quantity > 0)
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE order_items`)};
