-- Remove authentication columns from teams table
ALTER TABLE `teams` DROP COLUMN IF EXISTS `username`;
ALTER TABLE `teams` DROP COLUMN IF EXISTS `passwordHash`;

-- Remove awayTeamId from matches table
ALTER TABLE `matches` DROP COLUMN IF EXISTS `awayTeamId`;
