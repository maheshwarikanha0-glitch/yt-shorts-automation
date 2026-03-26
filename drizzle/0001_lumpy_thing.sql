CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` text NOT NULL,
	`tone` varchar(50) NOT NULL,
	`duration` varchar(10) NOT NULL,
	`hook` text,
	`script` text,
	`title` text,
	`hashtags` text,
	`scenes` text,
	`imagePrompts` text,
	`voiceType` varchar(50),
	`voiceAccent` varchar(50),
	`voiceTone` varchar(50),
	`voiceOverUrl` text,
	`videoUrl` text,
	`status` enum('draft','generating','ready','published','failed') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`generationId` int,
	`title` text NOT NULL,
	`topic` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledShorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`generationId` int NOT NULL,
	`scheduledTime` timestamp NOT NULL,
	`youtubeVideoId` varchar(255),
	`status` enum('scheduled','published','failed') DEFAULT 'scheduled',
	`publishedAt` timestamp,
	`analyticsViews` int DEFAULT 0,
	`analyticsLikes` int DEFAULT 0,
	`analyticsComments` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledShorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`defaultVoiceType` varchar(50) DEFAULT 'female',
	`defaultVoiceAccent` varchar(50) DEFAULT 'American',
	`defaultVoiceTone` varchar(50) DEFAULT 'energetic',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voiceSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `voiceSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `history` ADD CONSTRAINT `history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `history` ADD CONSTRAINT `history_generationId_generations_id_fk` FOREIGN KEY (`generationId`) REFERENCES `generations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduledShorts` ADD CONSTRAINT `scheduledShorts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduledShorts` ADD CONSTRAINT `scheduledShorts_generationId_generations_id_fk` FOREIGN KEY (`generationId`) REFERENCES `generations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voiceSettings` ADD CONSTRAINT `voiceSettings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;