CREATE TABLE `adamrmsinstallations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text,
	`firstheardtimestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`latestheardtimestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`rooturl` text NOT NULL,
	`location` text,
	`asn` text,
	`devmode` integer DEFAULT false NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`userdefinedstring` text DEFAULT '' NOT NULL,
	`version` text NOT NULL,
	`metadata` text DEFAULT [object Object]
);
--> statement-breakpoint
CREATE TABLE `adamrmstimeseries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`installationId` integer,
	`version` text NOT NULL,
	`metadata` text DEFAULT [object Object]
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adamrmsinstallations_uuid_unique` ON `adamrmsinstallations` (`uuid`);