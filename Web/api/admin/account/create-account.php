<?php

require_once __DIR__ . '/../../../config/database.php';


$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'Cashier';


$stmt = $conn->prepare('SELECT 1 FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();

if ($stmt->get_result()->fetch_row()) {
  die(json_encode(['success' => false, 'message' => 'That username is already taken.']));
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, 'Active')");
$stmt->bind_param('sss', $username, $hash, $role);
$stmt->execute();

notifyRealtime('account');

die(json_encode(['success' => true, 'message' => 'Account created']));
