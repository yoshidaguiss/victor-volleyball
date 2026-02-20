ALTER TABLE `rallies` ADD `playCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rallies` ADD `playSequence` json;--> statement-breakpoint
ALTER TABLE `rallies` ADD `endPattern` varchar(50);