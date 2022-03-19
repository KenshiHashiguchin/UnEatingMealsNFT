
-- +migrate Up
ALTER TABLE users ADD address varchar(255) AFTER email;
ALTER TABLE users ADD encryption_private_key varchar(255) AFTER address;

-- +migrate Down
ALTER TABLE users DROP COLUMN address;
ALTER TABLE users DROP COLUMN encryption_private_key;
