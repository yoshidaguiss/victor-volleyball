CREATE TABLE `serveOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`setNumber` int NOT NULL,
	`teamSide` enum('home','away') NOT NULL,
	`position` int NOT NULL,
	`playerId` int NOT NULL,
	`playerNumber` int NOT NULL,
	`playerName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serveOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `substitutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`setNumber` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`teamSide` enum('home','away') NOT NULL,
	`playerOutId` int NOT NULL,
	`playerOutNumber` int NOT NULL,
	`playerOutName` varchar(255) NOT NULL,
	`playerInId` int NOT NULL,
	`playerInNumber` int NOT NULL,
	`playerInName` varchar(255) NOT NULL,
	`isLibero` boolean NOT NULL DEFAULT false,
	CONSTRAINT `substitutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`setNumber` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`teamSide` enum('home','away') NOT NULL,
	`homeScore` int NOT NULL,
	`awayScore` int NOT NULL,
	`duration` int,
	`type` enum('technical','regular') NOT NULL DEFAULT 'regular',
	CONSTRAINT `timeouts_id` PRIMARY KEY(`id`)
);
