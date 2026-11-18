<?php
declare(strict_types=1);

function load_local_environment(string $path): void
{
    if (!is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if (
            $line === "" ||
            str_starts_with($line, "#") ||
            !str_contains($line, "=")
        ) {
            continue;
        }

        [$key, $value] = array_map("trim", explode("=", $line, 2));
        $value = trim($value, "\"'");
        if ($key !== "" && getenv($key) === false) {
            putenv($key . "=" . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

load_local_environment(__DIR__ . "/../.env");

function database_connection(): PDO
{
    static $connection = null;
    if ($connection instanceof PDO) {
        return $connection;
    }

    $configuration = [];
    foreach (["HOST", "PORT", "NAME", "USER", "PASSWORD"] as $key) {
        $value = getenv("RAILGO_DB_" . $key);
        if ($value === false) {
            throw new RuntimeException(
                "A required RailGo database environment variable is not configured.",
            );
        }
        $configuration[$key] = $value;
    }

    $host = $configuration["HOST"];
    $port = $configuration["PORT"];
    $name = $configuration["NAME"];
    $user = $configuration["USER"];
    $password = $configuration["PASSWORD"];

    if (
        !preg_match("/\A[a-zA-Z0-9._-]+\z/", $host) ||
        !ctype_digit($port) ||
        (int) $port < 1 ||
        (int) $port > 65535 ||
        !preg_match("/\A[a-zA-Z0-9_]+\z/", $name)
    ) {
        throw new RuntimeException(
            "The RailGo database configuration is invalid.",
        );
    }

    try {
        $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
        $serverConnection = new PDO($serverDsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $quotedName = str_replace("`", "``", $name);
        try {
            $serverConnection->exec(
                "CREATE DATABASE IF NOT EXISTS `{$quotedName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
            );
        } catch (PDOException $exception) {
            // A least-privilege account may be allowed to use an existing
            // database but not create databases.
        }

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
        $connection = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $exception) {
        throw new RuntimeException(
            "The RailGo database is unavailable.",
            0,
            $exception,
        );
    }

    return $connection;
}
