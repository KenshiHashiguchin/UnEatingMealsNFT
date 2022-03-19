-- +migrate Up
CREATE TABLE `users`
(
    `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`           VARCHAR(255) NOT NULL,
    `email`          VARCHAR(255) NOT NULL UNIQUE,
    `status`         INT          NOT NULL DEFAULT 0,
    `created_at`     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down
DROP TABLE `users`;