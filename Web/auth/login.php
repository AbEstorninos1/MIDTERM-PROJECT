<?php

session_start();
require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

$stmt = $conn->prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user['password_hash'])) {
  die(json_encode(['success' => false, 'message' => 'Wrong username or password.']));
}

if ($user['status'] === 'Pending') {
  die(json_encode(['success' => false, 'message' => 'Your account is still waiting for admin approval.']));
}

if ($user['status'] === 'Rejected') {
  die(json_encode(['success' => false, 'message' => 'Your registration was rejected by an admin.']));
}

if ($user['status'] !== 'Active') {
  die(json_encode(['success' => false, 'message' => 'This account is disabled. Please contact an admin.']));
}

session_regenerate_id(true);

$_SESSION['user'] = [
  'id' => (int) $user['id'],
  'username' => $user['username'],
  'role' => $user['role']
];

setLoginCookie($user['id'], $user['password_hash']);

echo json_encode([
  'success' => true,
  'redirect' => $user['role'] === 'Admin' ? './admin/dashboard.php' : './cashier/pos.php'
]);
