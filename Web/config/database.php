<?php
header('Content-Type: application/json');
ini_set('display_errors', '0');

set_exception_handler(function ($e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
});
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = '127.0.0.1';
$user = 'root';
$password = 'root';
$database = 'POS';

try {
  $conn = new mysqli($host, $user, $password, $database);
  $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
  
  die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// ---- Realtime (Node.js WebSocket server in /server) ----
// Tells the realtime server that something changed so every open page refreshes.
// If the server is not running nothing happens and the app works as normal.
if (!defined('REALTIME_URL')) define('REALTIME_URL', 'http://127.0.0.1:3000/notify');
if (!defined('REALTIME_KEY')) define('REALTIME_KEY', 'change-this-key'); // same as NOTIFY_KEY in server/server.js

function notifyRealtime($event, $data = []) {
  $context = stream_context_create([
    'http' => [
      'method' => 'POST',
      'header' => "Content-Type: application/json\r\nX-Notify-Key: " . REALTIME_KEY . "\r\n",
      'content' => json_encode(['event' => $event, 'data' => $data]),
      'timeout' => 0.5,
      'ignore_errors' => true
    ]
  ]);

  @file_get_contents(REALTIME_URL, false, $context);
}

// ---- Login cookie ----
// The cookie holds: user id . expiry time . signature.
// The signature uses the password hash, so changing the password logs the cookie out.
const COOKIE_NAME = 'login';
const COOKIE_SECRET = 'change-this-to-any-long-random-text';
const COOKIE_DAYS = 30;

function setLoginCookie($id, $passwordHash) {
  $expires = time() + COOKIE_DAYS * 86400;
  $signature = hash_hmac('sha256', $id . '|' . $expires . '|' . $passwordHash, COOKIE_SECRET);

  setcookie(COOKIE_NAME, $id . '.' . $expires . '.' . $signature, [
    'expires' => $expires,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
}

function clearLoginCookie() {
  setcookie(COOKIE_NAME, '', ['expires' => time() - 3600, 'path' => '/']);
}

// No session but a valid cookie: put the cookie data into the session.
function restoreLogin($conn) {
  if (isset($_SESSION['user']) || empty($_COOKIE[COOKIE_NAME])) return;

  $parts = explode('.', $_COOKIE[COOKIE_NAME]);
  if (count($parts) !== 3) return;

  [$id, $expires, $signature] = $parts;

  $stmt = $conn->prepare('SELECT id, username, password_hash, role, status FROM users WHERE id = ?');
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $user = $stmt->get_result()->fetch_assoc();

  if (!$user || $user['status'] !== 'Active' || (int) $expires < time()) {
    clearLoginCookie();
    return;
  }

  $expected = hash_hmac('sha256', $id . '|' . $expires . '|' . $user['password_hash'], COOKIE_SECRET);

  if (!hash_equals($expected, $signature)) {
    clearLoginCookie();
    return;
  }

  session_regenerate_id(true);

  $_SESSION['user'] = [
    'id' => (int) $user['id'],
    'username' => $user['username'],
    'role' => $user['role']
  ];
}
