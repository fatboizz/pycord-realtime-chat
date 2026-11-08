-- ==============================================================================
-- DACS2 - Real-Time Chat & Video Call Platform
-- Database Schema & Initial Seed Data
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `dacs` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `dacs`;

-- Disable foreign key checks during table setup
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Stores registered user accounts and authentication credentials
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    `status` VARCHAR(20) DEFAULT 'offline' COMMENT 'active, offline, busy, etc.',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: friendships
-- Stores friendship status and friend requests between users
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Sender of friend request',
    `friend_id` INT NOT NULL COMMENT 'Receiver of friend request',
    `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_friendship` (`user_id`, `friend_id`),
    INDEX `idx_friendships_user` (`user_id`),
    INDEX `idx_friendships_friend` (`friend_id`),
    INDEX `idx_friendships_status` (`status`),
    CONSTRAINT `fk_friendships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_friendships_friend` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: messages
-- Stores 1-on-1 direct messages between users
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` INT NOT NULL,
    `receiver_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_messages_sender_receiver` (`sender_id`, `receiver_id`, `created_at`),
    INDEX `idx_messages_receiver_sender` (`receiver_id`, `sender_id`, `created_at`),
    CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: groups
-- Stores group chat channel information
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_groups_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: group_members
-- Maps users to their group memberships
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `group_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_group_member` (`group_id`, `user_id`),
    INDEX `idx_gm_group` (`group_id`),
    INDEX `idx_gm_user` (`user_id`),
    CONSTRAINT `fk_gm_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: group_messages
-- Stores chat messages sent within group channels
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `group_messages`;
CREATE TABLE `group_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `group_id` INT NOT NULL,
    `sender_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_group_messages_group` (`group_id`, `created_at`),
    INDEX `idx_group_messages_sender` (`sender_id`),
    CONSTRAINT `fk_gmsg_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gmsg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- Initial Seed Data (Optional for testing)
-- Password for all sample users below: 123456 (Bcrypt hash)
-- Hash: $2b$12$D24VjCgLzWz0d5xO768iV.gPmsy3w0vV94eD7zM7sJgCjJmOq.sxe
-- ==============================================================================

INSERT INTO `users` (`id`, `username`, `email`, `password`, `status`) VALUES
(1, 'alice', 'alice@example.com', '$2b$12$e6m7x.tVpQZl0C7uE3Gf2e3O9gV.cR1/tK7P5S2Z9hQ4F.X1bQG9G', 'active'),
(2, 'bob', 'bob@example.com', '$2b$12$e6m7x.tVpQZl0C7uE3Gf2e3O9gV.cR1/tK7P5S2Z9hQ4F.X1bQG9G', 'offline'),
(3, 'charlie', 'charlie@example.com', '$2b$12$e6m7x.tVpQZl0C7uE3Gf2e3O9gV.cR1/tK7P5S2Z9hQ4F.X1bQG9G', 'offline')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- Sample friendship between Alice and Bob (accepted)
INSERT INTO `friendships` (`user_id`, `friend_id`, `status`) VALUES
(1, 2, 'accepted')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Sample group
INSERT INTO `groups` (`id`, `name`) VALUES
(1, 'General Discussion')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `group_members` (`group_id`, `user_id`) VALUES
(1, 1),
(1, 2)
ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`);

