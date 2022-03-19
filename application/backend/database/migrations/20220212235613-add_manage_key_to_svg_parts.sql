-- +migrate Up
ALTER TABLE `svg_parts` ADD `manage_name` varchar(255) DEFAULT NULL AFTER `network_type`;

-- +migrate Down
ALTER TABLE `svg_parts` DROP COLUMN `manage_name`;