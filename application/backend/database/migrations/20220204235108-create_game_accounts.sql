-- +migrate Up
CREATE TABLE `game_accounts`
(
    `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `address`    VARCHAR(255),
    `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down
DROP TABLE `game_accounts`;