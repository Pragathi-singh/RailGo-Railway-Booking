<?php
declare(strict_types=1);

require_once __DIR__ . "/../includes/database.php";

function runSqlStatements(PDO $connection, string $sql): void
{
    $statements = preg_split('/;\s*(?:\r?\n|$)/', $sql);
    if (!is_array($statements)) {
        throw new RuntimeException("The schema could not be parsed.");
    }

    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (
            $statement === "" ||
            preg_match("/\A\s*CREATE\s+DATABASE\b/i", $statement) === 1 ||
            preg_match("/\A\s*USE\s+/i", $statement) === 1
        ) {
            continue;
        }
        $connection->exec($statement);
    }
}

function tableColumns(PDO $connection, string $table): array
{
    $quotedTable = str_replace("`", "``", $table);
    $rows = $connection->query("SHOW COLUMNS FROM `{$quotedTable}`");

    return $rows === false
        ? []
        : array_map(
            static fn(array $row): string => (string) $row["Field"],
            $rows->fetchAll(),
        );
}

$connection = database_connection();
$connection->exec("SET FOREIGN_KEY_CHECKS=1");

$schema = file_get_contents(__DIR__ . "/schema.sql");
if ($schema === false) {
    throw new RuntimeException("The RailGo schema file could not be read.");
}

runSqlStatements($connection, $schema);

$columns = tableColumns($connection, "users");
if (!in_array("name", $columns, true)) {
    $connection->exec(
        "ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL AFTER id",
    );
}
$connection->exec(
    "UPDATE users SET name = COALESCE(NULLIF(name, ''), full_name, email)
     WHERE name IS NULL OR name = ''",
);
$connection->exec("ALTER TABLE users MODIFY name VARCHAR(100) NOT NULL");
if (!in_array("address", $columns, true)) {
    $connection->exec(
        "ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL AFTER password_hash",
    );
}

$scheduleColumns = tableColumns($connection, "train_schedules");
if (!in_array("source", $scheduleColumns, true)) {
    // Train and schedule compatibility is supplied by the canonical tables.
}

echo "RailGo PHP schema migration completed.\n";
