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
    CREATE TABLE orders (
    order_id         SERIAL,
    user_id           INT           NOT NULL,
    address_id         INT           NOT NULL,
    total_amount        INT           NOT NULL,
    status               VARCHAR(20)   NOT NULL DEFAULT 'pending_payment',
    payment_method       VARCHAR(15)   NOT NULL,
    created_at            TIMESTAMP     DEFAULT NOW(),
    updated_at            TIMESTAMP,
    deleted_at            TIMESTAMP,

    CONSTRAINT pk_order_id PRIMARY KEY (order_id),
    CONSTRAINT fk_order_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_order_address_id FOREIGN KEY (address_id) REFERENCES addresses(address_id),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('cash_on_delivery', 'online_payment', 'installment')),
    CONSTRAINT chk_status CHECK (status IN (
        'pending_payment',
        'processing',
        'sourcing',
        'warehouse',
        'packaging',
        'shipped',
        'delivered',
        'cancelled'
    ))
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE orders`)};
