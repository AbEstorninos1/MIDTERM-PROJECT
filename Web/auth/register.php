<?php

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

$stmt = $conn->prepare('SELECT 1 FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();

if ($stmt->get_result()->fetch_row()) {
  die(json_encode(['success' => false, 'message' => 'That username is already taken.']));
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$conn->begin_transaction();

$first = (int) $conn->query('SELECT COUNT(*) FROM users FOR UPDATE')->fetch_row()[0] === 0;
$role = $first ? 'Admin' : 'Cashier';
$status = $first ? 'Active' : 'Pending';

$stmt = $conn->prepare('INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $username, $hash, $role, $status);
$stmt->execute();
$conn->commit();

notifyRealtime('account');

die(json_encode([
  'success' => true,
  'message' => $first
    ? 'Admin account created. You can log in now.'
    : 'Account submitted. Please wait for an admin to approve it before you can log in.'
]));
