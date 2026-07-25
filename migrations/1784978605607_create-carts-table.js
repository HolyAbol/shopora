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
    CREATE TABLE carts (
    cart_id       SERIAL,
    user_id        INT NOT NULL,
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT pk_cart_id PRIMARY KEY (cart_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT uq_user_id UNIQUE (user_id)
);`)};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {pgm.sql(` DROP TABLE carts`)};
