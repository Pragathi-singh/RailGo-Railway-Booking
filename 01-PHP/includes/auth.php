<?php
declare(strict_types=1);

const LOGIN_WINDOW_SECONDS = 600;
const LOGIN_MAX_ATTEMPTS = 5;

function current_user(): ?array
{
    $user = $_SESSION["user"] ?? null;

    return is_array($user) ? $user : null;
}

function find_account(string $identifier): ?array
{
    $needle = strtolower(trim($identifier));
    $statement = database_connection()->prepare(
        'SELECT id, name, full_name, email, mobile, password_hash
         FROM users
         WHERE email = :email
            OR LOWER(name) = :name
            OR LOWER(full_name) = :full_name
         LIMIT 1',
    );
    $statement->execute([
        "email" => $needle,
        "name" => $needle,
        "full_name" => $needle,
    ]);
    $account = $statement->fetch();

    return is_array($account) ? $account : null;
}

function create_account(array $account): bool
{
    try {
        $statement = database_connection()->prepare(
            'INSERT INTO users
                (name, full_name, email, mobile, password_hash)
             VALUES
                (:name, :full_name, :email, :mobile, :password_hash)',
        );
        $statement->execute([
            "name" => (string) $account["full_name"],
            "full_name" => (string) $account["full_name"],
            "email" => strtolower((string) $account["email"]),
            "mobile" => (string) $account["mobile"],
            "password_hash" => (string) $account["password_hash"],
        ]);
        return true;
    } catch (PDOException $exception) {
        if ($exception->getCode() === "23000") {
            return false;
        }
        throw new RuntimeException(
            "The account could not be saved.",
            0,
            $exception,
        );
    }
}

function password_meets_policy(string $password): bool
{
    return preg_match(
        "/\A(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}\z/us",
        $password,
    ) === 1;
}

function login_is_rate_limited(): bool
{
    $now = time();
    $attempts = $_SESSION["login_attempts"] ?? [];
    if (!is_array($attempts)) {
        $attempts = [];
    }

    $attempts = array_values(
        array_filter(
            $attempts,
            static fn($attempt): bool => is_int($attempt) &&
                $now - $attempt < LOGIN_WINDOW_SECONDS,
        ),
    );
    $_SESSION["login_attempts"] = $attempts;

    return count($attempts) >= LOGIN_MAX_ATTEMPTS;
}

function record_login_failure(): void
{
    $attempts = $_SESSION["login_attempts"] ?? [];
    if (!is_array($attempts)) {
        $attempts = [];
    }

    $attempts[] = time();
    $_SESSION["login_attempts"] = $attempts;
}

function authenticate(
    string $identifier,
    string $password,
    bool $remember = false,
): bool {
    $account = find_account($identifier);
    if (
        $account === null ||
        !isset($account["password_hash"]) ||
        !is_string($account["password_hash"]) ||
        !password_verify($password, $account["password_hash"])
    ) {
        return false;
    }

    configure_remembered_session($remember);
    if (!session_regenerate_id(true)) {
        throw new RuntimeException(
            "The session could not be renewed after login.",
        );
    }

    $_SESSION["user"] = [
        "id" => (string) $account["id"],
        "full_name" => (string) ($account["name"] ?: $account["full_name"]),
        "email" => (string) $account["email"],
    ];
    unset($_SESSION["login_attempts"]);

    return true;
}

function configure_remembered_session(bool $remember): void
{
    if (!$remember) {
        return;
    }

    $cookie = session_get_cookie_params();
    $cookie["lifetime"] = 604800;
    session_set_cookie_params($cookie);
}
