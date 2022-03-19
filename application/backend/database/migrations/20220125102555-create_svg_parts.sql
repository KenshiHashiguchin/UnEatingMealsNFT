-- +migrate Up
CREATE TABLE `svg_parts`
(
    `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `network_type` INT UNSIGNED NOT NULL,
    `part_type`    VARCHAR(255) NOT NULL,
    `body_hash`    VARCHAR(255),
    `style_hash`   VARCHAR(255),
    `script_hash`  VARCHAR(255),
    `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down
DROP TABLE `svg_parts`;