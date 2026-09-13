export const up = (pgm) => {
  pgm.sql(`CREATE TABLE shops(
shop_id SERIAL NOT NULL,
owner_id integer NOT NULL,
shop_name varchar(100) NOT NULL,
created_at timestamp without time zone DEFAULT now(),
updated_at timestamp without time zone,
deleted_at timestamp without time zone,
PRIMARY KEY(shop_id),
CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES users(user_id)
);
`);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE shops`);
};
