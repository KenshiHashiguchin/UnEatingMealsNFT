-- +migrate Up
CREATE TABLE `game_scores`
(
    `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `game_id`      INT UNSIGNED NOT NULL,
    `mosaic_id`    VARCHAR(255) NOT NULL ,
    `score`        INT UNSIGNED NOT NULL,
    `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down
DROP TABLE `game_scores`;