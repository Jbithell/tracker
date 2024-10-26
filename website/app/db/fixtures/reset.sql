-- Reset the database by dropping all the tables.
PRAGMA defer_foreign_keys = true;
DROP TABLE IF EXISTS events;
SELECT name FROM sqlite_master; -- Display the tables in the database that haven't been deleted (for debugging purposes)
PRAGMA defer_foreign_keys = false;