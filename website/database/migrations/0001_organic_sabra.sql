CREATE TABLE `timing_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`applicable_dates` text DEFAULT '[]',
	`order` integer DEFAULT 99999 NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`radius` integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "timestamp", "data") SELECT "id", "timestamp", "data" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;