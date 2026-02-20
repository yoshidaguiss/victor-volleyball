CREATE TABLE `aiAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`scope` text NOT NULL,
	`model` varchar(100) NOT NULL DEFAULT 'gemini-pro',
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`userId` int,
	CONSTRAINT `aiAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchCode` varchar(8) NOT NULL,
	`date` timestamp NOT NULL,
	`venue` varchar(255),
	`homeTeamId` int NOT NULL,
	`homeTeamName` varchar(255) NOT NULL,
	`awayTeamName` varchar(255) NOT NULL,
	`sets` int NOT NULL DEFAULT 5,
	`isPracticeMatch` boolean NOT NULL DEFAULT false,
	`status` enum('preparing','inProgress','completed') NOT NULL DEFAULT 'preparing',
	`currentSet` int NOT NULL DEFAULT 1,
	`scoreHome` json,
	`scoreAway` json,
	`timeoutsHome` int NOT NULL DEFAULT 0,
	`timeoutsAway` int NOT NULL DEFAULT 0,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`),
	CONSTRAINT `matches_matchCode_unique` UNIQUE(`matchCode`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`number` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`position` enum('S','MB','WS','OP','L') NOT NULL,
	`isLibero` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rallyId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`playType` enum('serve','receive','set','attack','block','dig') NOT NULL,
	`teamSide` enum('home','away') NOT NULL,
	`playerId` int NOT NULL,
	`playerNumber` int NOT NULL,
	`playerName` varchar(255) NOT NULL,
	`positionX` float NOT NULL,
	`positionY` float NOT NULL,
	`details` json,
	`result` enum('point','continue','error') NOT NULL,
	CONSTRAINT `plays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rallies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`setNumber` int NOT NULL,
	`rallyNumber` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`homeScoreBefore` int NOT NULL DEFAULT 0,
	`awayScoreBefore` int NOT NULL DEFAULT 0,
	`homeScoreAfter` int NOT NULL DEFAULT 0,
	`awayScoreAfter` int NOT NULL DEFAULT 0,
	`winner` enum('home','away'),
	`duration` int,
	CONSTRAINT `rallies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamName` varchar(255) NOT NULL,
	`season` varchar(50),
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
