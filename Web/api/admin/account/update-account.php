<?php

require_once __DIR__ . '/../../../config/database.php';

session_start();
$admin = $_SESSION['user'] ?? ['id' => 0];

$data = json_decode(file_get_contents('php://input'), true);
$id = (int) ($data['id'] ?? 0);
$action = $data['action'] ?? '';

$stmt = $conn->prepare('SELECT id, username, role, status FROM users WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$target = $stmt->get_result()->fetch_assoc();

if (!$target) die(json_encode(['success' => false, 'message' => 'Account not found.']));

function activeAdminCount($conn) {
  return (int) $conn->query("SELECT COUNT(*) FROM users WHERE role = 'Admin' AND status = 'Active'")->fetch_row()[0];
}

function protectLastAdmin($conn, $target, $admin) {
  if ($target['id'] === (int) $admin['id']) {
    die(json_encode(['success' => false, 'message' => 'You cannot disable or demote your own account.']));
  }

  if ($target['role'] === 'Admin' && $target['status'] === 'Active' && activeAdminCount($conn) <= 1) {
    die(json_encode(['success' => false, 'message' => 'You cannot remove the last active admin.']));
  }
}

$target['id'] = (int) $target['id'];

switch ($action) {
  case 'approve':
    if ($target['status'] !== 'Pending') 
      die(json_encode(['success' => false, 'message' => 'Only pending accounts can be approved.']));
    $newStatus = 'Active';
    break;

  case 'reject':
    if ($target['status'] !== 'Pending')
      die(json_encode(['success' => false, 'message' => 'Only pending accounts can be rejected.']));
    $newStatus = 'Rejected';
    break;

  case 'disable':
    if ($target['status'] !== 'Active') 
      die(json_encode(['success' => false, 'message' => 'Only active accounts can be disabled.']));
    protectLastAdmin($conn, $target, $admin);
    $newStatus = 'Inactive';
    break;

  case 'enable':
    if (!in_array($target['status'], ['Inactive', 'Rejected'], true)) 
      die(json_encode(['success' => false, 'message' => 'This account is already active or pending.']));
    $newStatus = 'Active';
    break;

  case 'remove':
    if ($target['id'] === (int) $admin['id'])
      die(json_encode(['success' => false, 'message' => 'You cannot remove your own account.']));

    if ($target['role'] === 'Admin' && $target['status'] === 'Active' && activeAdminCount($conn) <= 1)
      die(json_encode(['success' => false, 'message' => 'You cannot remove the last active admin.']));

    try {
      $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
      $stmt->bind_param('i', $id);
      $stmt->execute();
    } catch (mysqli_sql_exception $e) {
      die(json_encode(['success' => false, 'message' => 'This account has sales records and cannot be removed. Disable it instead.']));
    }

    notifyRealtime('account');

    die(json_encode(['success' => true, 'message' => 'Account removed']));

  case 'edit':
    $username = trim($data['username'] ?? '');
    $role = $data['role'] ?? '';
    $password = $data['password'] ?? '';

    if (!in_array($role, ['Admin', 'Cashier'], true)) die(json_encode(['success' => false, 'message' => 'Invalid role.']));
    if ($password !== '' && strlen($password) < 6) die(json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']));

    if ($role !== 'Admin' && $target['role'] === 'Admin') {
      protectLastAdmin($conn, $target, $admin);
    }

    $stmt = $conn->prepare('SELECT 1 FROM users WHERE username = ? AND id <> ?');
    $stmt->bind_param('si', $username, $id);
    $stmt->execute();

    if ($stmt->get_result()->fetch_row()) die(json_encode(['success' => false, 'message' => 'That username is already taken.']));

    if ($password !== '') {
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt = $conn->prepare('UPDATE users SET username = ?, role = ?, password_hash = ? WHERE id = ?');
      $stmt->bind_param('sssi', $username, $role, $hash, $id);
    } else {
      $stmt = $conn->prepare('UPDATE users SET username = ?, role = ? WHERE id = ?');
      $stmt->bind_param('ssi', $username, $role, $id);
    }

    $stmt->execute();

    if ($id === (int) $admin['id']) {
      $_SESSION['user']['username'] = $username;
    }

    notifyRealtime('account');

    die(json_encode(['success' => true, 'message' => 'Account updated']));

  default:
    die(json_encode(['success' => false, 'message' => 'Unknown action.']));
}

$stmt = $conn->prepare('UPDATE users SET status = ? WHERE id = ?');
$stmt->bind_param('si', $newStatus, $id);
$stmt->execute();

notifyRealtime('account');

die(json_encode(['success' => true, 'message' => 'Account ' . strtolower($newStatus)]));
