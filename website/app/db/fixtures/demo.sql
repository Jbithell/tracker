-- Setup dummy demo data for the database
PRAGMA defer_foreign_keys = true;
SELECT name FROM sqlite_master; -- Display the tables in the database just as a placeholder
PRAGMA defer_foreign_keys = false;