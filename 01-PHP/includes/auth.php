<?php
declare(strict_types=1);

const LOGIN_WINDOW_SECONDS = 600;
const LOGIN_MAX_ATTEMPTS = 5;

function current_user(): ?array
{
    $user = $_SESSION['user'] ?? null;

    return is_array($user) ? $user : null;
}

function account_store_path(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'accounts.json';
}

function open_account_store(int $lockMode)
{
    $directory = dirname(account_store_path());
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('The account data directory could not be created.');
    }

    if (DIRECTORY_SEPARATOR !== '\\' && !chmod($directory, 0700)) {
        throw new RuntimeException('Safe permissions could not be set on the account data directory.');
    }
    $handle = fopen(account_store_path(), 'c+');
    if ($handle === false) {
        throw new RuntimeException('The account store could not be opened.');
    }

    if (!flock($handle, $lockMode)) {
        fclose($handle);
        throw new RuntimeException('The account store could not be locked.');
    }

    if (DIRECTORY_SEPARATOR !== '\\' && !chmod(account_store_path(), 0600)) {
        flock($handle, LOCK_UN);
        fclose($handle);
        throw new RuntimeException('Safe permissions could not be set on the account store.');
    }

    return $handle;
}

function decode_accounts($handle): array
{
    rewind($handle);
    $contents = stream_get_contents($handle);
    if ($contents === false) {
        throw new RuntimeException('The account store could not be read.');
    }

    if (trim($contents) === '') {
        return [];
    }

    try {
        $accounts = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException('The account store contains invalid JSON.', 0, $exception);
    }

    if (!is_array($accounts) || !array_is_list($accounts)) {
        throw new RuntimeException('The account store has an invalid format.');
    }

    foreach ($accounts as $account) {
        if (!is_array($account)
            || !isset($account['id'], $account['full_name'], $account['email'], $account['mobile'], $account['password_hash'])
            || !is_string($account['id'])
            || !is_string($account['full_name'])
            || !is_string($account['email'])
            || !is_string($account['mobile'])
            || !is_string($account['password_hash'])) {
            throw new RuntimeException('The account store contains an invalid account record.');
        }
    }

    return $accounts;
}

function read_accounts(): array
{
    $handle = open_account_store(LOCK_SH);
    try {
        return decode_accounts($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function find_account(string $identifier): ?array
{
    $needle = strtolower(trim($identifier));
    foreach (read_accounts() as $account) {
        if (!is_array($account)) {
            continue;
        }
        $email = isset($account['email']) ? strtolower((string) $account['email']) : '';
        $name = isset($account['full_name']) ? strtolower((string) $account['full_name']) : '';
        if ($needle === $email || $needle === $name) {
            return $account;
        }
    }

    return null;
}

function create_account(array $account): bool
{
    $handle = open_account_store(LOCK_EX);
    try {
        $accounts = decode_accounts($handle);
        $email = strtolower((string) $account['email']);
        foreach ($accounts as $existingAccount) {
            if (is_array($existingAccount)
                && strtolower((string) ($existingAccount['email'] ?? '')) === $email) {
                return false;
            }
        }

        $accounts[] = $account;
        $json = json_encode($accounts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        if (!ftruncate($handle, 0) || !rewind($handle)) {
            throw new RuntimeException('The account store could not be prepared for writing.');
        }

        $payload = $json . PHP_EOL;
        $offset = 0;
        while ($offset < strlen($payload)) {
            $written = fwrite($handle, substr($payload, $offset));
            if ($written === false || $written === 0) {
                throw new RuntimeException('The account could not be saved.');
            }
            $offset += $written;
        }
        if (!fflush($handle)) {
            throw new RuntimeException('The account could not be saved.');
        }

        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function password_meets_policy(string $password): bool
{
    return preg_match('/\A(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}\z/us', $password) === 1;
}

function login_is_rate_limited(): bool
{
    $now = time();
    $attempts = $_SESSION['login_attempts'] ?? [];
    if (!is_array($attempts)) {
        $attempts = [];
    }

    $attempts = array_values(array_filter(
        $attempts,
        static fn ($attempt): bool => is_int($attempt) && ($now - $attempt) < LOGIN_WINDOW_SECONDS
    ));
    $_SESSION['login_attempts'] = $attempts;

    return count($attempts) >= LOGIN_MAX_ATTEMPTS;
}

function record_login_failure(): void
{
    $attempts = $_SESSION['login_attempts'] ?? [];
    if (!is_array($attempts)) {
        $attempts = [];
    }

    $attempts[] = time();
    $_SESSION['login_attempts'] = $attempts;
}

function authenticate(string $identifier, string $password, bool $remember = false): bool
{
    $account = find_account($identifier);
    if ($account === null
        || !isset($account['password_hash'])
        || !is_string($account['password_hash'])
        || !password_verify($password, $account['password_hash'])) {
        return false;
    }

    configure_remembered_session($remember);
    if (!session_regenerate_id(true)) {
        throw new RuntimeException('The session could not be renewed after login.');
    }

    $_SESSION['user'] = [
        'id' => (string) ($account['id'] ?? ''),
        'full_name' => (string) ($account['full_name'] ?? ''),
        'email' => (string) ($account['email'] ?? ''),
    ];
    unset($_SESSION['login_attempts']);

    return true;
}

function configure_remembered_session(bool $remember): void
{
    if (!$remember) {
        return;
    }

    $cookie = session_get_cookie_params();
    $cookie['lifetime'] = 604800;
    session_set_cookie_params($cookie);
}
