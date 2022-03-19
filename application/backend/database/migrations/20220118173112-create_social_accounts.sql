-- +migrate Up
CREATE TABLE `social_accounts`
(
    `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT UNSIGNED NOT NULL,
    `provider`   VARCHAR(255) NOT NULL,
    `sub`        VARCHAR(255) NOT NULL UNIQUE,
    `email`      VARCHAR(255) NOT NULL,
    `name`       VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- +migrate Down
DROP TABLE `social_accounts`;